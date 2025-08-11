"use client";
import React, { useState } from 'react';
import Image from 'next/image'; // Nhập Image từ Next.js

interface InputMessageProps {
  onSend: (message: string) => void;
}

const InputMessage: React.FC<InputMessageProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Ngăn chặn việc tạo dòng mới
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim() === '') {
      setError('Lời nhắn là bắt buộc');
      // Thiết lập hẹn giờ để xóa thông báo lỗi sau 1 giây
      setTimeout(() => {
        setError('');
      }, 1000);
      return; // Ngăn chặn gửi tin nhắn trống
    }
    setError(''); // Xóa thông báo lỗi nếu có
    onSend(message);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex justify-center items-center mb-4 flex-col"> {/* Thay đổi để tạo một cột cho thông báo lỗi và form */}
      {/* Hiển thị thông báo lỗi nếu có */}
      {error && (
        <div className="w-1/2 p-2 bg-gray-300 rounded-lg text-black text-center mb-2"> {/* Căn giữa và thêm nền xám */}
          <span>{error}</span>
        </div>
      )}
      <form className="w-1/2 flex items-center p-4 bg-white text-black rounded-lg shadow-lg">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          placeholder="Nhập tin nhắn của bạn"
          rows={1}
          className="flex-grow border-2 border-gray-300 p-2 rounded-lg resize-none min-h-10 max-h-[30vh] overflow-y-auto"
          onKeyDown={handleKeyDown}
          required
        />
        <button type="button" onClick={handleSendMessage} className="ml-2 p-2 bg-gray-400 text-white rounded-lg flex items-center">
          <Image 
            src="/send.svg" // Đường dẫn đến file icon
            alt="Gửi"
            width={24} // Chiều rộng của icon
            height={24} // Chiều cao của icon
          />
        </button> 
      </form>
    </div>
  );
}

export default InputMessage;