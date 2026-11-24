import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import './Assistant.css';

const MAX_LENGTH = 500;

const SUGGESTIONS = [
  'How do I recycle an old phone battery safely?',
  'Which materials can be recovered from a laptop?',
  'Where can I recycle a television?',
  'How do I earn Green Credits?',
];

const WELCOME = {
  role: 'assistant',
  text: 'Hello! I am your AI Recycling Assistant. Ask me about identifying e-waste, recycling, material recovery or recycling points.',
};

const describeError = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.status === 404) {
    return 'API not found (404). Restart the backend and check that server.js has the assistant route.';
  }
  if (err.response) {
    return `Request failed (${err.response.status}). Check the backend terminal.`;
  }
  return 'Cannot reach the backend. Make sure it is running.';
};

function Assistant() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  // Notun message ashle chat er shesh e scroll kore
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const question = text.trim();
    if (!question || loading) return;

    setError('');

    // Welcome message bad diye shudhu asol conversation history hishebe jabe
    const history = messages
      .filter((item) => item !== WELCOME)
      .map((item) => ({ role: item.role, text: item.text }));

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/assistant/chat', {
        message: question,
        history,
      });
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      // Fail hole proshno ta soriye input e ferot dei, jate abar pathate pare
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClear = () => {
    setMessages([WELCOME]);
    setInput('');
    setError('');
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="chat-container">
      <div className="chat-top">
        <div>
          <h2>AI Recycling Assistant</h2>
          <p className="chat-hint">
            Ask about e-waste identification, recycling, material recovery and
            recycling points.
          </p>
        </div>
        <button className="chat-clear" onClick={handleClear}>
          Clear chat
        </button>
      </div>

      <div className="chat-window">
        {messages.map((item, index) => (
          <div className={`chat-row ${item.role}`} key={index}>
            <div className="chat-bubble">{item.text}</div>
          </div>
        ))}

        {showSuggestions && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map((question) => (
              <button
                key={question}
                className="chat-chip"
                disabled={loading}
                onClick={() => sendMessage(question)}
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="chat-row assistant">
            <div className="chat-bubble typing">Thinking...</div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {error && <div className="chat-error">{error}</div>}

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          maxLength={MAX_LENGTH}
          disabled={loading}
        />
        <button
          className="chat-send"
          type="submit"
          disabled={loading || !input.trim()}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>

      <div className="chat-count">
        {input.length} / {MAX_LENGTH}
      </div>

      <p className="chat-note">
        AI answers can be wrong. Check important details, and use the Recycling
        Points page for the latest point information.
      </p>
    </div>
  );
}

export default Assistant;