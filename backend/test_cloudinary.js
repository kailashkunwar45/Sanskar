const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Manual configuration for the test
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
  console.log("Testing Cloudinary Connection...");
  console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
  
  try {
    const result = await cloudinary.uploader.upload("https://dummyimage.com/600x400/000/fff&text=Sanskar+App+Test", {
      folder: "sanskar-test",
    });
    console.log("SUCCESS! Image uploaded.");
    console.log("URL:", result.secure_url);
    console.log("Public ID:", result.public_id);
    
    console.log("\nDeleting test image...");
    await cloudinary.uploader.destroy(result.public_id);
    console.log("Cleaned up successfully.");
    process.exit(0);
  } catch (error) {
    console.error("FAILED to upload image.");
    console.error(error);
    process.exit(1);
  }
}

testUpload();
