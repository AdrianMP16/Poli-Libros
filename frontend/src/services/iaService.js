const API_URL = `${process.env.VITE_API_URL}/api/chatIA`;

export const sendMessageToAssistant = async (message) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userMessage: message }),
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.reply;
        
    } catch (error) {
        console.error("Error al comunicarse con el servicio de IA:", error);
        return "Lo siento, tuve un problema al conectar con el servidor. Intenta de nuevo más tarde.";
    }
};