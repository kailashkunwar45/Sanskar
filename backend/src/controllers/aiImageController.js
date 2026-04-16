const { validationResult } = require("express-validator");

function handleValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors.array();
    throw error;
  }
}

async function generateImage(req, res, next) {
  try {
    handleValidation(req);
    const { prompt, type } = req.body;
    
    // MOCK AI GENERATION & OPTIMIZATION FOR MOBILE
    // In production, you would call OpenAI/DALL-E or Midjourney API here.
    const mockImageUrl = `https://dummyimage.com/600x400/000/fff&text=${encodeURIComponent(type + ": " + prompt)}`;
    
    return res.status(200).json({ 
      success: true, 
      imageUrl: mockImageUrl,
      optimizedForMobile: true
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { generateImage };
