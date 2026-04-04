const transporter = {
    sendMail: async (options) => {
        const payload = {
            sender: { email: options.from || process.env.SENDER_EMAIL },
            to: [{ email: options.to }],
            subject: options.subject,
        };

        // Brevo API requires either htmlContent or textContent specifically matching these key names
        if (options.html) {
            payload.htmlContent = options.html;
        }
        if (options.text) {
            payload.textContent = options.text;
        }

        /* 
          Render blocks outbound SMTP ports 587/465, so we use their REST API on port 443!
          Brevo expects the API key in the 'api-key' header.
        */
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY || process.env.SMTP_PASS,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to send email via Brevo REST API');
        }

        return data;
    }
};

export default transporter;