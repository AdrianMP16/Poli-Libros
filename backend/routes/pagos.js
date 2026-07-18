const express = require("express");
const Stripe = require("stripe");
const { verificarAutenticado } = require("../middlewares/authMiddleware");
const { admin } = require("../config/firebase");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const db = admin.firestore();

// 1. RUTA PARA CREAR LA SESIÓN DE PAGO (Protegida)
router.post("/create-checkout-session", verificarAutenticado, async (req, res) => {
    console.log("====== ENTRÓ A CREATE CHECKOUT ======");
    console.log(req.user);
    try {
        const { cart, studentName } = req.body;
        const libroId = cart[0].id; // Asumimos un libro por transacción

        // Consultamos la información real del libro en Firebase
        const libroRef = db.collection('libros').doc(libroId);
        const doc = await libroRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "El libro no existe en la base de datos." });
        }

        const datosLibro = doc.data();

        if (!datosLibro.disponibilidad) {
            return res.status(400).json({ error: "Este libro ya ha sido vendido." });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: datosLibro.nivel || "Libro de Inglés",
                            description: datosLibro.descripcion || "Poli-Libros"
                        },
                        unit_amount: Math.round(datosLibro.precio * 100) // Stripe requiere centavos
                    },
                    quantity: 1
                }
            ],
            success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CLIENT_URL}/cancel`,
            metadata: {
                studentName: studentName || "Sin nombre",
                bookId: libroId,
                buyerId: req.user.uid // El uid viene del token decodificado por verificarAutenticado
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
        console.error("Error creando sesión:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. FUNCIÓN DEL WEBHOOK (Se ejecuta fuera del enrutador normal)
const manejarWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Fallo la verificación del Webhook:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const idLibroPagado = session.metadata.bookId;

        console.log("✅ Pago confirmado para el libro:", idLibroPagado);

        try {
            // Marcamos el libro como vendido en Firestore
            await db.collection('libros').doc(idLibroPagado).update({
                disponibilidad: false,
                comprador_id: session.metadata.buyerId,
                fecha_venta: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log("Estado del libro actualizado en la base de datos.");
        } catch (dbError) {
            console.error("Error al actualizar Firestore:", dbError);
        }
    }

    res.json({ received: true });
};

module.exports = { router, manejarWebhook };