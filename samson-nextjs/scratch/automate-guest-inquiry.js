const { chromium } = require('playwright');

/**
 * Automates submitting 5 appointment requests (inquiries) as a guest from the public homepage,
 * using 1-hour intervals.
 * 
 * RUN INSTRUCTIONS:
 * 1. Run the script:
 *    node scratch/automate-guest-inquiry.js
 */
async function submitMultipleGuestInquiries() {
  const BASE_URL = 'http://localhost:3000';
  const intervals = ['09:00', '10:00', '11:00', '12:00', '13:00'];

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false }); // Change to true to run headless
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    for (let i = 0; i < intervals.length; i++) {
      const preferredTime = intervals[i];
      const guestNum = i + 1;
      const firstName = `Jane${guestNum}`;
      const lastName = 'Smith';
      const email = `janesmith${guestNum}@example.com`;
      const phone = `0917765432${guestNum}`;

      console.log(`\n--- Booking Inquiry ${guestNum}/5 at ${preferredTime} ---`);
      console.log(`Navigating to public homepage: ${BASE_URL}`);
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      // 1. Scroll/navigate to the contact section booking form
      console.log('Scrolling to booking form...');
      const contactSection = page.locator('#contact');
      await contactSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500); // Small pause for scroll

      // 2. Fill in guest name details
      console.log(`Filling name details: ${firstName} ${lastName}`);
      await page.fill('input[placeholder="Eleanor"]', firstName);
      await page.fill('input[placeholder="Vance"]', lastName);

      // 3. Fill in contact info
      console.log(`Filling contact details: ${email}, ${phone}`);
      await page.fill('input[placeholder="eleanor@domain.com"]', email);
      await page.fill('input[placeholder="+1 (555) 000-0000"]', phone);

      // 4. Select Specialty Pathway (Service)
      console.log('Selecting treatment pathway...');
      await page.selectOption('select:near(label:has-text("Select Specialty Pathway"))', { index: 1 });

      // 5. Wait for the calendar's dates to load
      console.log('Waiting for calendar available dates to finish scanning...');
      const scanningIndicator = page.locator('text=Scanning available dates...');
      // Wait for scanning text to appear first if any, then wait for it to disappear
      try {
        await scanningIndicator.waitFor({ state: 'visible', timeout: 1000 });
      } catch (e) {
        // Indicator might have already finished/not shown, continue
      }
      await scanningIndicator.waitFor({ state: 'hidden', timeout: 5000 });

      // 6. Fill Preferred Start Time
      console.log(`Setting preferred start time to ${preferredTime}...`);
      await page.fill('input[type="time"]', preferredTime);

      // 7. Click the first available date in the calendar (excluding Prev/Next buttons)
      console.log('Locating first available day button...');
      const firstAvailableDateButton = page.locator('#booking-form-card button:not([disabled]):not(:has-text("Prev")):not(:has-text("Next"))').first();
      await firstAvailableDateButton.waitFor({ state: 'visible', timeout: 5000 });
      
      const dateText = await firstAvailableDateButton.innerText();
      console.log(`Clicking calendar date: Day ${dateText}`);
      await firstAvailableDateButton.click();

      // Add notes
      console.log('Adding notes...');
      await page.fill('textarea[placeholder*="sensory preferences"]', `Automated guest request test ${guestNum} at ${preferredTime}.`);

      // 8. Submit inquiry request
      console.log('Submitting secure inquiry request...');
      await page.click('button[type="submit"]');

      // 9. Wait for success view
      console.log('Waiting for confirmation view...');
      await page.waitForSelector('text=Reservation Received', { timeout: 10000 });
      console.log(`Guest booking request ${guestNum}/5 submitted successfully!`);
      
      // Small delay between submissions
      await page.waitForTimeout(1000);
    }

    console.log('\nAll 5 guest booking requests completed successfully!');

  } catch (error) {
    console.error('An error occurred during guest booking requests:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

submitMultipleGuestInquiries();
