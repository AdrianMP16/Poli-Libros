const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HF_TOKEN);

const keywords = [
    'libro', 'libros', 'ingles', 'compra', 'venta', 'plataforma', 
    'polilibros', 'precio', 'usuario', 'cuenta', 'registro', 'envio'
];

function esRelevante(mensaje) {
    const texto = mensaje.toLowerCase();
    // Verifica si al menos una de las palabras clave existe en el mensaje
    return keywords.some(keyword => texto.includes(keyword));
}

router.post('/', async (req, res) => {
    try {
        const { userMessage } = req.body;

        if (!userMessage) {
            return res.status(400).json({ error: "El mensaje es requerido" });
        }

        if (!esRelevante(userMessage)) {
            return res.json({ 
                reply: "Lo siento, solo puedo ayudarte con temas relacionados a Polilibros (libros, compra, venta, etc.)." 
            });
        }

        const response = await hf.chatCompletion({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente exclusivo de Polilibros, una plataforma para la compra y venta de libros de inglés. Tus reglas estrictas son: 1. SOLO respondes temas relacionados con Polilibros, libros de inglés, y el funcionamiento del marketplace. 2. Si el usuario pregunta sobre cualquier otro tema (política, deportes, consejos generales, etc.), responde amablemente: 'Lo siento, solo puedo ayudarte con temas relacionados a Polilibros'. 3. NO respondas preguntas fuera de este contexto bajo ninguna circunstancia. 4. Si no conoces la respuesta sobre la plataforma, di que no sabes."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            max_tokens: 200,
            temperature: 0.4
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
