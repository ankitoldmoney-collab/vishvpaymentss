const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BLADEPAY_API_URL = 'https://api.bladepay.pro/merchant/api/payin/create';
const BLADEPAY_AUTH_TOKEN = 'Bearer gw_e1c1e49c5076c2175eff76bed7929be45ce92dc661af121c4ccc362beb32b055';

app.post('/api/index', async (req, res) => {
    try {
        const { mobileNumber, amount } = req.body;

        if (!mobileNumber || !amount) {
            return res.status(400).json({ success: false, message: 'Mobile number and amount are required' });
        }

        const merchantOrderNo = 'ORD-' + Date.now();

        const payload = {
            merchantOrderNo: merchantOrderNo,
            amount: amount.toString(),
            currency: "INR",
            payinName: "Customer",
            payinPhone: mobileNumber,
            payinEmail: "customer@example.com",
            notifyUrl: "https://yourdomain.com/api/payin-webhook",
            returnUrl: "https://yourdomain.com/payment-success"
        };

        const response = await axios.post(BLADEPAY_API_URL, payload, {
            headers: {
                'Authorization': BLADEPAY_AUTH_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.code === 0) {
            const cashierUrl = response.data.data.cashierUrl;
            return res.json({ success: false, cashierUrl }); // Note: Frontend me humne check kiya hai data.cashierUrl
        } else {
            return res.status(400).json({ success: false, message: response.data.msg || 'Payment initialization failed' });
        }

    } catch (error) {
        console.error('Payment Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.response?.data || error.message });
    }
});

// Local testing ke liye
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
