const CATALOG = {
  "military-zone-tee": { name: "Military Zone Tee", price: 20000, sizes: ["S","M","L","XL","XXL"] }
};
const json = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(body) });

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" }, body: "" };
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return json(500, { error: "Paystack is not configured on the store server." });
  try {
    const { customer, items } = JSON.parse(event.body || "{}");
    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address || !customer?.city) return json(400, { error: "Complete all required customer and delivery details." });
    if (!Array.isArray(items) || !items.length) return json(400, { error: "Your cart is empty." });
    let total = 0;
    const cleanItems = [];
    for (const item of items) {
      const product = CATALOG[item.id];
      const qty = Number(item.qty);
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > 10 || !product.sizes.includes(item.size)) return json(400, { error: "Invalid product, size or quantity in cart." });
      total += product.price * qty;
      cleanItems.push({ name: product.name, size: item.size, quantity: qty, unit_price: product.price });
    }
    if (total < 100) return json(400, { error: "Invalid order amount." });
    const origin = event.headers.origin || process.env.URL || "https://crymicsoul.netlify.app";
    const payload = {
      email: customer.email,
      amount: total * 100,
      currency: "NGN",
      callback_url: `${origin}/?payment=return`,
      metadata: {
        custom_fields: [
          { display_name: "Customer name", variable_name: "customer_name", value: String(customer.name).slice(0,80) },
          { display_name: "Phone", variable_name: "phone", value: String(customer.phone).slice(0,30) },
          { display_name: "Delivery city", variable_name: "city", value: String(customer.city).slice(0,80) },
          { display_name: "Delivery address", variable_name: "address", value: String(customer.address).slice(0,180) },
          { display_name: "Items", variable_name: "items", value: JSON.stringify(cleanItems).slice(0,450) }
        ]
      }
    };
    const resp = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    if (!resp.ok || !data.status) return json(502, { error: data.message || "Paystack initialization failed." });
    return json(200, { authorization_url: data.data.authorization_url, reference: data.data.reference });
  } catch (e) {
    return json(500, { error: "Unable to initialize payment." });
  }
};
