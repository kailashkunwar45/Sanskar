const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Listen to console logs from the page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    console.log("Navigating to login...");
    await page.goto('http://localhost:8081/login');
    
    console.log("Waiting for inputs...");
    await page.waitForSelector('input[placeholder="you@example.com"]');
    
    console.log("Typing credentials...");
    await page.type('input[placeholder="you@example.com"]', 'admin@test.com');
    await page.type('input[placeholder="Enter your password"]', 'password123');
    
    console.log("Clicking Sign In...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('div[role="button"]'));
      const loginBtn = btns.find(b => b.textContent.includes('Sign In'));
      if (loginBtn) loginBtn.click();
    });
    
    console.log("Waiting 3s for navigation...");
    await new Promise(r => setTimeout(r, 3000));
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("PAGE TEXT EXTRACT:\n", bodyText.substring(0, 500));
    
    await browser.close();
  } catch (err) {
    console.error("Puppeteer error:", err);
    process.exit(1);
  }
})();
