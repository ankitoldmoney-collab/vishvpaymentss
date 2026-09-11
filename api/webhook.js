export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const callbackData = req.body;

    // IMPORTANT:
    // Add BladePay webhook signature verification here
    // if required by their documentation.

    console.log("BladePay webhook received:", callbackData);

    // Acknowledge callback
    return res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error("Webhook error:", error);

    return res.status(500).json({
      error: "Webhook processing failed"
    });
  }
}
