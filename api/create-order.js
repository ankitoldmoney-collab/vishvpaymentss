export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { mobile, amount } = req.body || {};

    // Validate mobile number
    if (!mobile || !/^[0-9]{10}$/.test(String(mobile))) {
      return res.status(400).json({
        error: "Invalid mobile number"
      });
    }

    // Validate amount
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 10) {
      return res.status(400).json({
        error: "Minimum amount is ₹10"
      });
    }

    // API key must be stored in Vercel Environment Variables
    const apiKey = process.env.BLADEPAY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Payment gateway is not configured"
      });
    }

    // Unique merchant order number
    const merchantOrderNo =
      "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 10000);

    // Current website URL
    const origin = `https://${req.headers.host}`;

    const payload = {
      merchantOrderNo: merchantOrderNo,
      amount: numericAmount.toFixed(2),
      currency: "INR",
      payinName: "Customer",
      payinPhone: String(mobile),
      payinEmail: "customer@example.com",

      // BladePay can call this URL for payment callback
      notifyUrl: `${origin}/api/webhook`,

      // Customer return URL after payment
      returnUrl: `${origin}/`
    };

    const gatewayResponse = await fetch(
      "https://api.bladepay.pro/merchant/api/payin/create",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await gatewayResponse.json();

    if (!gatewayResponse.ok) {
      console.error("BladePay HTTP error:", data);

      return res.status(502).json({
        error: "Payment gateway request failed"
      });
    }

    // Based on the API response shown in your documentation
    const cashierUrl = data?.data?.cashierUrl;

    if (data?.code !== 0 || !cashierUrl) {
      console.error("BladePay order creation error:", data);

      return res.status(502).json({
        error: data?.msg || "Unable to create payment order"
      });
    }

    return res.status(200).json({
      success: true,
      merchantOrderNo: merchantOrderNo,
      cashierUrl: cashierUrl
    });

  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
