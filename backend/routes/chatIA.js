const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HF_TOKEN);

router.post('/', async (req, res) => {
    try {
        const { userMessage } = req.body;

        if (!userMessage) {
            return res.status(400).json({ error: "El mensaje es requerido" });
        }

        const response = await hf.chatCompletion({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente virtual amigable para Polilibros, un marketplace de compra y venta de libros de inglés de segunda mano. Tu objetivo es ayudar a los estudiantes a encontrar materiales de estudio adecuados para su nivel y responder dudas sobre cómo funciona la plataforma. Sé conciso y amable. Adicionalmente, no des más información de la necesaria, no respondas preguntas que no tienen nada que ver con el propósito de la página web, y no inventes información. Si no sabes la respuesta, di que no sabes."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            max_tokens: 200,
            temperature: 0.7
        });

        const botReply = response.choices?.[0]?.message?.content || "Lo siento, no pude generar una respuesta.";
        res.json({ reply: botReply });

    } catch (error) {
        console.error("===== ERROR COMPLETO =====");

        console.error(error);

        console.error("Mensaje:");
        console.error(error.message);

        console.error("Body:");

        if (error.httpResponse) {
            console.dir(error.httpResponse.body, { depth: null });
        }

        console.error("=========================");

        res.status(500).json({
            error: "Hubo un error al procesar el mensaje con la IA"
        });
    }
});

module.exports = router;
