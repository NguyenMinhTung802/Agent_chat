import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

interface ChatProps {
  messages: Message[];
}

const Chat: React.FC<ChatProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null); // Tham chiếu đến phần tử cuối cùng

  // Cuộn đến tin nhắn mới nhất khi messages thay đổi
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' }); // Cuộn đến phần tử
    }
  }, [messages]);

  return (
    <div className="w-1/2 mx-auto flex-grow p-4 overflow-y-auto text-black">
      {messages.map((msg, index) => (
        <div key={`${msg.sender}-${index}`} className={`mb-2 ${msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
          {msg.sender === 'agent' && (
            <Image 
              src="/AI_bot.svg" 
              alt="AI Bot"
              width={40}
              height={40}
              className="mr-2" 
            />
          )}
          <span className={`inline-block p-2 rounded-lg break-words ${msg.sender === 'user' ? 'text-black bg-gray-100 rounded-lg' : 'text-black'}`}>
            {msg.text.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </span>
        </div>
      ))}
      <div ref={endOfMessagesRef} /> {/* Phần tử để cuộn đến */}
    </div>
  );
}

export default Chat;