import React, { useState } from 'react';
import { sendMessageToAssistant } from '../services/iaService';
import '../styles/ChatAssistant.css';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "¡Hola! Soy el asistente de Polilibros. ¿En qué te puedo ayudar hoy?", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input;
        setInput('');
        
        setMessages(prev => [...prev, { text: userText, isBot: false }]);
        setIsLoading(true);

        const botReply = await sendMessageToAssistant(userText);
        
        setMessages(prev => [...prev, { text: botReply, isBot: true }]);
        setIsLoading(false);
    };

    return (
        <div className="chat-container">
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h4>Asistente Polilibros</h4>
                        <button onClick={toggleChat} className="close-btn">X</button>
                    </div>
                    
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && <div className="message bot">Escribiendo...</div>}
                    </div>

                    <form onSubmit={handleSend} className="chat-input-area">
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            placeholder="Escribe tu duda..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>Enviar</button>
                    </form>
                </div>
            )}

            <button className="chat-toggle-btn" onClick={toggleChat}>
                {isOpen ? 'Cerrar' : 'Ayuda'}
            </button>
        </div>
    );
};

export default ChatAssistant;