# CRYMIC SOUL — ecommerce starter

This is a deployable storefront with:
- Product cards and product enquiry links
- Shopping bag saved in the customer's browser
- Quantity controls, remove-item controls and subtotal calculation
- Checkout form
- WhatsApp order handoff
- Paystack hosted checkout using a Netlify serverless function
- Server-side payment verification

## Before you launch

### 1. Check your store details
Open `script.js` and update:
- `STORE.whatsapp` — international format, digits only (Nigeria: 234...)
- `STORE.paystackPublicKey` — your Paystack **public** key
- Product names, sizes and prices in `PRODUCTS`

The supplied page listed the Military Zone Tee at ₦20,000. Other pieces were marked for enquiry / had no confirmed price, so they are enquiry-only until you set their price. The campaign look is editorial, not purchasable.

If you add a priced product, also add the exact same product ID, price and permitted sizes to `netlify/functions/create-payment.js`. The server calculates the charge independently; do not rely on prices sent by a browser.

### 2. Add your product photos
Place your real photos in the `images` folder using the filenames in `script.js`, or edit each product's `image` path. Missing photos show a designed fallback visual.

### 3. Configure Paystack securely
1. Create/verify your Paystack business account and obtain your keys from the Paystack dashboard.
2. In Netlify, open **Site configuration → Environment variables**.
3. Add `PAYSTACK_SECRET_KEY` with your Paystack **secret** key. Never put this secret in `script.js`, HTML, GitHub, or a public file.
4. Set `STORE.paystackPublicKey` in `script.js` to your Paystack **public** key.
5. Deploy/redeploy the site so the function receives the environment variable.
6. Test with Paystack test keys first. Switch to live keys only after your account is approved and you have tested the full order flow.

The serverless functions are under `netlify/functions`. A static-only host without Netlify Functions will still support WhatsApp ordering, but Paystack checkout will not initialize.

### 4. Deploy
- Push this project folder to your GitHub repository.
- In Netlify, import that repository.
- Build command: leave blank.
- Publish directory: `.`
- Netlify will read `netlify.toml` and deploy the functions.
- Add the Paystack environment variable before testing payments.

## Important launch checks
- Confirm the WhatsApp number belongs to the store and can receive orders.
- Confirm every product price, size and stock status.
- Configure delivery pricing and communicate the delivery fee before fulfilment. This starter does not calculate courier fees.
- Add your returns, privacy and delivery policies before accepting public orders.
- Run a complete test payment and confirm the transaction in your Paystack dashboard before fulfilling any order.

## Current limitations
This is a functioning small-store starter, not a full inventory/admin system. Cart data is stored on the shopper's device. Orders paid through Paystack can be verified by reference, but this starter does not yet write orders into a database, send automated email receipts, manage stock, or provide an admin dashboard. WhatsApp orders require manual confirmation.
