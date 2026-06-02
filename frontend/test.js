const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST_FAILED:', request.url(), request.failure().errorText));
  
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0' });
  
  // Try to click the Calendar tab if it's there
  try {
    // The calendar tab text is "Calendar" or icon might be something else
    await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('div'));
      const cal = texts.find(el => el.textContent === 'Calendar');
      if (cal) cal.click();
    });
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) {
    console.log("Could not click Calendar", e);
  }
  
  await browser.close();
})();
