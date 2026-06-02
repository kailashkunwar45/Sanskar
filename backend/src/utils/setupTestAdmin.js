const axios = require("axios");

async function setupAdmin() {
  const email = "admin@test.com";
  const password = "password";
  const name = "System Admin";
  
  try {
    // 1. Try to register
    console.log("Registering admin candidate...");
    try {
      await axios.post("http://localhost:5001/api/auth/register", {
        name, email, password, role: "customer"
      });
      console.log("Registration successful.");
    } catch (e) {
      if (e.response && e.response.status === 409) {
        console.log("User already exists, proceeding to promotion.");
      } else {
        throw e;
      }
    }
    
    // 2. Promote to admin
    console.log("Promoting to admin...");
    const { exec } = require("child_process");
    exec(`node src/utils/promoteAdmin.js ${email}`, (err, stdout, stderr) => {
      if (err) console.error(err);
      console.log(stdout);
      console.log(stderr);
    });
    
  } catch (error) {
    console.error("Setup failed:", error.message);
  }
}

setupAdmin();
