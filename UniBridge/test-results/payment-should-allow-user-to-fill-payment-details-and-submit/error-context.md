# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payment.spec.ts >> should allow user to fill payment details and submit
- Location: payment.spec.ts:3:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/payment
Call log:
  - navigating to "http://localhost:3000/payment", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('should allow user to fill payment details and submit', async ({ page }) => {
  4  |   // 1. Navigate to your website (replace with your local or hosted URL)
> 5  |   await page.goto('http://localhost:3000/payment');
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/payment
  6  | 
  7  |   // 2. Select the Payment Method (Credit/Debit Card)
  8  |   await page.getByLabel('Credit/Debit Card').check();
  9  | 
  10 |   // 3. Fill in the "Name on Card"
  11 |   // Based on your screenshot, the placeholder is "John Doe"
  12 |   await page.getByPlaceholder('John Doe').fill('Tumalka Kavindu');
  13 | 
  14 |   // 4. Fill in the "Card Number"
  15 |   await page.getByPlaceholder('1234 5678 9012 3456').fill('4242 4242 4242 4242');
  16 | 
  17 |   // 5. Fill Expiry and CVV
  18 |   await page.getByPlaceholder('MM/YY').fill('12/28');
  19 |   await page.getByPlaceholder('123').fill('999');
  20 | 
  21 |   // 6. Click the "Pay $9.99" button
  22 |   // Note: It's best to use getByRole for buttons
  23 |   const payButton = page.getByRole('button', { name: /Pay \$9.99/i });
  24 |   await payButton.click();
  25 | 
  26 |   // 7. Assertion: Verify what happens after payment
  27 |   // For example, checking if a success message appears
  28 |   await expect(page.getByText('Payment Successful')).toBeVisible();
  29 | }); 
```