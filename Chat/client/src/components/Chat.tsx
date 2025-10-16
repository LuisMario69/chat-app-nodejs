
import '../styles/Chat.css';

interface ChatProps {
  username: string;
  onLogout: () => void;
}

function Chat({ username, onLogout }: ChatProps) {
  return (
    <div className="chat-welcome-page">
      <div className="chat-welcome-container">
        <h2>Bienvenido, {username}!</h2>
        <p>
          El componente del chat se implementará en el siguiente paso.
        </p>
        <button onClick={onLogout} className="logout-button">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default Chat;