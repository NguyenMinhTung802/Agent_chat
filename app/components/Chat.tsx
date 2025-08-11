import React from 'react';
import Image from 'next/image'; // Nhập `Image` từ Next.js

// Định nghĩa các interface như trước
interface Message {
  sender: 'user' | 'agent';
  text: string;
}

interface ChatProps {
  messages: Message[];
}

// Bắt đầu component
const Chat: React.FC<ChatProps> = ({ messages }) => {
  return (
    <div className="w-4/5 flex-grow p-4 overflow-y-auto text-black">
      {messages.map((msg, index) => (
        <div 
          key={`${msg.sender}-${index}`} // đảm bảo khóa là duy nhất
          className={`mb-2 ${msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
        >
          {msg.sender === 'agent' && (
            <Image 
              src="/AI_bot.svg" // Đường dẫn tới icon
              alt="AI Bot"
              width={40} // Đặt kích thước icon
              height={40}
              className="mr-2" // Thêm khoảng cách bên phải
            />
          )}
          <span className={`inline-block p-2 rounded break-words ${msg.sender === 'user' ? 'bg-blue-300 text-black' : 'bg-gray-200 text-black'}`}>
            {msg.text.split('\n').map((line, i) => ( // Tách dòng để hiển thị xuống dòng chính xác
              <span key={i}>
                {line}
                <br /> {/* Thêm ký tự xuống dòng */}
              </span>
            ))}
            {/* {msg.text} */}
          </span>
        </div>
      ))}
    </div>
  );
}

export default Chat;