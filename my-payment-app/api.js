export default function handler(req, res) {
    if (req.method === 'POST') {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount provided' });
        }

        // Yahan aap apna payment gateway (jaise Stripe, Razorpay) ka logic laga sakte hain
        return res.status(200).json({ 
            success: true, 
            message: `Successfully processed payment of ₹${amount}`,
            amount: amount 
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
