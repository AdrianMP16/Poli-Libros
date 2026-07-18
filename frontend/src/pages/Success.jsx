import { useNavigate } from 'react-router-dom';
import '../styles/Success.css';

export default function Success() {
    const navigate = useNavigate();

    return (
        <div className="success-container">
            <div className="success-card">
                <div className="success-icon">✅</div>
                <h1 className="success-title">¡Pago Exitoso!</h1>
                <p className="success-message">
                    Tu compra se ha procesado correctamente. Ya hemos notificado al vendedor para que puedan coordinar la entrega de tu libro.
                </p>

                <button 
                    className="success-button"
                    onClick={() => navigate('/')}
                >
                    Volver al catálogo
                </button>
            </div>
        </div>
    );
}