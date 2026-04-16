const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/Order");

// ─── Config ────────────────────────────────────────────
const ESEWA_SECRET = process.env.ESEWA_SECRET || "8g8M8llP8Fve0D68";
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const ESEWA_VERIFY_URL =
  process.env.ESEWA_VERIFY_URL ||
  "https://uat.esewa.com.np/api/epay/transaction/status/";
const ESEWA_PAY_URL =
  process.env.ESEWA_PAY_URL ||
  "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

const KHALTI_SECRET_KEY =
  process.env.KHALTI_SECRET_KEY || "test_secret_key_placeholder";
const KHALTI_INITIATE_URL =
  process.env.KHALTI_INITIATE_URL ||
  "https://a.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL =
  process.env.KHALTI_LOOKUP_URL ||
  "https://a.khalti.com/api/v2/epayment/lookup/";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ─── Helpers ───────────────────────────────────────────
async function findOrderOrFail(orderId) {
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }
  return order;
}

function assertNotPaid(order) {
  if (order.paymentStatus === "paid") {
    const error = new Error("Order already paid");
    error.statusCode = 400;
    throw error;
  }
}

// ═══════════════════════════════════════════════════════
// eSewa
// ═══════════════════════════════════════════════════════

// @desc    Initiate eSewa payment
// @route   POST /api/payment/esewa/initiate
// @access  Private
const initiateEsewaPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await findOrderOrFail(orderId);
    assertNotPaid(order);

    const amount = order.totalPrice;
    const delivery_charge = 0;
    const service_charge = 0;
    const tax_amount = 0;
    const total_amount = amount + delivery_charge + service_charge + tax_amount;
    const transaction_uuid = `${orderId}-${Date.now()}`;

    // Generate HMAC-SHA256 signature
    const signatureData = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
    const signature = crypto
      .createHmac("sha256", ESEWA_SECRET)
      .update(signatureData)
      .digest("base64");

    // Persist payment method & transaction reference
    order.paymentMethod = "esewa";
    order.paymentDetails = { transactionId: transaction_uuid };
    await order.save();

    const esewaForm = {
      amount: amount.toString(),
      tax_amount: tax_amount.toString(),
      total_amount: total_amount.toString(),
      transaction_uuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: service_charge.toString(),
      product_delivery_charge: delivery_charge.toString(),
      success_url: `${FRONTEND_URL}/payment-success`,
      failure_url: `${FRONTEND_URL}/payment-failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    };

    res.status(200).json({
      success: true,
      payment_url: ESEWA_PAY_URL,
      formData: esewaForm,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify eSewa payment (server-to-server)
// @route   POST /api/payment/esewa/verify
// @access  Private
const verifyEsewaPayment = async (req, res, next) => {
  try {
    const { data } = req.body; // base64 encoded data from eSewa redirect

    if (!data) {
      const error = new Error("No data received from eSewa");
      error.statusCode = 400;
      throw error;
    }

    // Decode base64 response
    const decodedData = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8")
    );
    const { transaction_uuid, status, total_amount, transaction_code } =
      decodedData;

    const orderId = transaction_uuid.split("-")[0];
    const order = await findOrderOrFail(orderId);

    if (status !== "COMPLETE") {
      order.paymentStatus = "failed";
      await order.save();
      const error = new Error("Payment failed or is still pending");
      error.statusCode = 400;
      throw error;
    }

    // ── Server-to-server verification with eSewa API ──
    try {
      const verifyResponse = await axios.get(ESEWA_VERIFY_URL, {
        params: {
          product_code: ESEWA_PRODUCT_CODE,
          total_amount,
          transaction_uuid,
        },
        timeout: 10000,
      });

      const verifyData = verifyResponse.data;

      if (
        verifyData.status !== "COMPLETE" ||
        String(verifyData.total_amount) !== String(total_amount)
      ) {
        order.paymentStatus = "failed";
        await order.save();
        const error = new Error(
          "eSewa server verification failed — amount or status mismatch"
        );
        error.statusCode = 400;
        throw error;
      }
    } catch (verifyError) {
      // If the verify call itself fails (network, timeout) mark as failed
      if (!verifyError.statusCode) {
        order.paymentStatus = "failed";
        await order.save();
        const error = new Error(
          "eSewa verification service unavailable. Please try again."
        );
        error.statusCode = 502;
        throw error;
      }
      throw verifyError;
    }

    // All checks passed ✓
    order.paymentStatus = "paid";
    order.status = "processing";
    order.paymentDetails = {
      transactionId: transaction_uuid,
      referenceId: transaction_code,
    };
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════
// Khalti
// ═══════════════════════════════════════════════════════

// @desc    Initiate Khalti payment
// @route   POST /api/payment/khalti/initiate
// @access  Private
const initiateKhaltiPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate("user", "name email");
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }
    assertNotPaid(order);

    const khaltiPayload = {
      return_url: `${FRONTEND_URL}/payment-verify?method=khalti`,
      website_url: FRONTEND_URL,
      amount: order.totalPrice * 100, // Khalti expects paisa
      purchase_order_id: order._id.toString(),
      purchase_order_name: `Order #${order._id}`,
      customer_info: {
        name: order.user.name,
        email: order.user.email,
      },
    };

    // Call Khalti initiate API
    const khaltiResponse = await axios.post(KHALTI_INITIATE_URL, khaltiPayload, {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    // Persist payment method & Khalti pidx
    order.paymentMethod = "khalti";
    order.paymentDetails = {
      transactionId: khaltiResponse.data.pidx,
    };
    await order.save();

    res.status(200).json({
      success: true,
      message: "Khalti payment initiated",
      pidx: khaltiResponse.data.pidx,
      payment_url: khaltiResponse.data.payment_url,
    });
  } catch (error) {
    // Pass through Khalti API errors with context
    if (error.response) {
      const apiErr = new Error(
        error.response.data?.detail || "Khalti initiation failed"
      );
      apiErr.statusCode = error.response.status;
      return next(apiErr);
    }
    next(error);
  }
};

// @desc    Verify Khalti payment (server-to-server lookup)
// @route   POST /api/payment/khalti/verify
// @access  Private
const verifyKhaltiPayment = async (req, res, next) => {
  try {
    const { pidx, orderId } = req.body;

    if (!pidx) {
      const error = new Error("pidx is required for verification");
      error.statusCode = 400;
      throw error;
    }

    const order = await findOrderOrFail(orderId);

    // ── Server-to-server lookup ──
    let lookupData;
    try {
      const lookupResponse = await axios.post(
        KHALTI_LOOKUP_URL,
        { pidx },
        {
          headers: {
            Authorization: `Key ${KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );
      lookupData = lookupResponse.data;
    } catch (lookupError) {
      order.paymentStatus = "failed";
      await order.save();
      const error = new Error(
        lookupError.response?.data?.detail ||
          "Khalti verification service unavailable"
      );
      error.statusCode = lookupError.response?.status || 502;
      throw error;
    }

    // Validate status & amount
    if (lookupData.status !== "Completed") {
      order.paymentStatus = "failed";
      await order.save();
      const error = new Error(
        `Payment not completed. Status: ${lookupData.status}`
      );
      error.statusCode = 400;
      throw error;
    }

    const expectedAmountPaisa = order.totalPrice * 100;
    if (lookupData.total_amount !== expectedAmountPaisa) {
      order.paymentStatus = "failed";
      await order.save();
      const error = new Error("Amount mismatch during Khalti verification");
      error.statusCode = 400;
      throw error;
    }

    // All checks passed ✓
    order.paymentStatus = "paid";
    order.status = "processing";
    order.paymentDetails = {
      transactionId: lookupData.pidx,
      referenceId: lookupData.transaction_id,
    };
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Khalti payment verified", order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateEsewaPayment,
  verifyEsewaPayment,
  initiateKhaltiPayment,
  verifyKhaltiPayment,
};
