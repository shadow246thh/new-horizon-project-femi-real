const json = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(body) });
exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const reference = event.queryStringParameters?.reference;
  if (!secret || !reference) return json(400, { status: "unverified", error: "Missing payment configuration or reference." });
  try {
    const resp = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secret}` } });
    const data = await resp.json();
    if (!resp.ok || !data.status) return json(502, { status: "unverified", error: data.message || "Could not verify payment." });
    const paid = data.data.status === "success" && data.data.currency === "NGN";
    return json(200, { status: paid ? "success" : data.data.status, reference: data.data.reference, amount: data.data.amount, currency: data.data.currency });
  } catch (e) {
    return json(500, { status: "unverified", error: "Verification request failed." });
  }
};
