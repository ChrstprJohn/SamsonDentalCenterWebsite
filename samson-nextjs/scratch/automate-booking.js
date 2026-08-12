const { chromium } = require('playwright');

/**
 * Automates booking an appointment via the Secretary portal.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install playwright:
 *    pnpm add -D playwright
 * 2. Run the script:
 *    node scratch/automate-booking.js
 */
async function bookAppointment() {
  const BASE_URL = 'http://localhost:3000';
  const STAFF_EMAIL = 'secretary@example.com'; // Change to your test secretary/admin email
  const STAFF_PASSWORD = 'secretary@example.com';        // Change to your test password

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false }); // Set to true to run in background
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Log in
    console.log(`Navigating to login page: ${BASE_URL}/auth/login`);
    await page.goto(`${BASE_URL}/auth/login`);
    
    console.log('Filling in login credentials...');
    await page.fill('input[type="email"]', STAFF_EMAIL);
    await page.fill('input[type="password"]', STAFF_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/secretary-v2**');
    console.log('Logged in successfully!');

    // 2. Navigate to Booking Page
    console.log('Navigating to book page...');
    await page.goto(`${BASE_URL}/secretary-v2/book`);
    await page.waitForLoadState('networkidle');

    // 3. Click "Book New Appointment" button in the footer / sidebar
    console.log('Clicking "Book New Appointment"...');
    await page.click('button:has-text("Book New Appointment")');

    // 4. Fill in Guest Info (defaulting to Guest mode here)
    console.log('Switching to Register Guest mode...');
    await page.click('button:has-text("Register Guest")');

    console.log('Filling guest details...');
    await page.fill('input[placeholder*="First Name"]', 'John');
    await page.fill('input[placeholder*="Last Name"]', 'Doe');
    await page.fill('input[placeholder*="Phone"]', '09171234567');
    await page.fill('input[placeholder*="Email"]', 'johndoe@example.com');

    // 5. Select Service
    console.log('Selecting service...');
    await page.selectOption('select[title*="Service"]', { index: 1 }); // Selects first available service

    // 6. Select Date
    console.log('Selecting date...');
    // Picks tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateStr);

    // 7. Select Dentist/Doctor
    console.log('Selecting doctor...');
    await page.selectOption('select[title*="Doctor"]', { index: 1 }); // Selects first doctor

    // 8. Select Time Slot
    console.log('Selecting time slot...');
    await page.selectOption('select[title*="Time"]', { index: 1 }); // Selects first time slot

    // 9. Submit booking
    console.log('Submitting booking...');
    await page.click('button:has-text("Confirm Booking")');

    // Wait for success toast/indication
    await page.waitForSelector('text=Appointment booked successfully!', { timeout: 10000 });
    console.log('Appointment booked successfully!');

  } catch (error) {
    console.error('An error occurred during booking:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

bookAppointment();
