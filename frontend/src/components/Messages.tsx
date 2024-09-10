import { useState } from 'react';
import { FaPaperPlane, FaSmile } from 'react-icons/fa';
import { Button } from './ui/button';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), text: input, sender: 'user' }]);
      setInput('');
    }
  };

  return (
    <div className="bg-gray-100 max-w-md mx-auto my-4 rounded-lg shadow-lg flex flex-col h-[30rem]">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 text-gray-800 self-start'}`}
          >
            {message.text}
          </div>
        ))}
      </div>
      
      <div className="bg-white p-4 flex items-center border-t border-gray-300">
        <Button className="p-2 text-gray-600" aria-label="Add emoji">
          <FaSmile />
        </Button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2 border rounded-lg ml-2"
          placeholder="Type a message..."
        />
        <Button onClick={handleSend} className="p-2 text-blue-500 ml-2">
          <FaPaperPlane />
        </Button>
      </div>
    </div>
  );
};

export default ChatBox;
