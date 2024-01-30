import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const dtfile = useSelector((state) => state.dtfile);

  useEffect(() => {
    if (dtfile === null) {
      navigate('/');
    }
  }, [dtfile, navigate]);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sidebar, setSidebar] = useState(false);

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputValue, sender: 'user' },
      ]);
      // In a real scenario, you would send the message to the chatbot and get the response.
      // For simplicity, we'll just echo the user's message here.
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `You said: ${inputValue}`, sender: 'bot' },
      ]);
      setInputValue('');
      console.log(messages);
    }
  };

  return (
    <div className='w-full pt-5 px-2 absolute -top-5'>
      <div className='flex h-screen pt-16'>
        {/* Left Sidebar */}
        {sidebar && (
          <div className='w-1/2 p-4 overflow-y-auto shadow-md'>
            <p className='text-lg font-semibold'>Chatbot Name</p>
            <p className='text-gray-500'>Some sidebar text here...</p>
          </div>
        )}

        {/* Chat Container */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          {/* Chat Content */}
          <div className='flex-1 overflow-y-auto p-4'>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat ${
                  message.sender === 'user' ? 'chat-end' : 'chat-start'
                }`}
              >
                <div className='chat-image avatar'>
                  <div className='w-10 rounded-full'>
                    {message.sender === 'user' ? (
                      <img alt='user' src='images/user.png' />
                    ) : (
                      <img alt='bot' src='images/bot.png' />
                    )}
                  </div>
                </div>
                <div className='chat-bubble'>{message.text}</div>
                <div className='chat-footer opacity-50'>Delivered</div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div className='flex-shrink-0 p-4 border-t bg-white flex items-center'>
            <input
              type='text'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder='Type your message...'
              className='flex-1 p-2 border rounded-l-md'
            />
            <button
              onClick={handleSendMessage}
              className='px-4 py-2 bg-blue-500 text-white rounded-r-md'
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
