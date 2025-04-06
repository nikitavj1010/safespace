require('dotenv').config();
//console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);
const express = require('express');
const cors = require('cors');

// Import fetch properly
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a compassionate AI assistant for a mental health support app. Provide empathetic responses without giving medical advice. Have your language suited for teens in school and connect with them according to their style. If they talk in a casual manner respond in kind and try to communicate in the same style. They need to feel like they're talking to a friend so maintain the same level of casualness and make them feel comfortable sharing. Look out for deep seated issues that make them sound angry or if it feels like they are about to hurt themselves or others encourage strongly to connect with a counselor, peer suppport volunteer or a trusted adult" },
                    { role: "user", content: message }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Check if the response has the expected structure
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            res.json({ reply: data.choices[0].message.content });
        } else {
            console.error('Unexpected response structure:', data);
            res.status(500).json({ error: 'Unexpected response from OpenAI' });
        }

    } catch (error) {
        console.error('Error communicating with OpenAI:', error.message);
        res.status(500).json({ error: 'Failed to get a response from OpenAI' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
