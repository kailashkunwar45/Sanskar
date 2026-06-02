const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0' });
  
  console.log("Page loaded. Trying to find Calendar button in Quick Access...");
  
  try {
    // Find a div/Text that contains "Calendar" and click its parent Pressable
    const clicked = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('div'));
      const calText = texts.find(el => el.textContent.trim() === 'Calendar');
      if (calText) {
        calText.click();
        return true;
      }
      return false;
    });
    
    console.log("Calendar clicked:", clicked);
    await new Promise(r => setTimeout(r, 5000)); // wait to see if it crashes
  } catch (e) {
    console.log("Could not click Calendar", e);
  }
  
  await browser.close();
})();
