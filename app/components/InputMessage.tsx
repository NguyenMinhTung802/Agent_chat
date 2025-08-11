"use client";
import React, { useState } from 'react';

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
  };

  return (
    <div>
      {/* Hiển thị thông báo lỗi nếu có */}
      {error && (
        <div className="flex justify-center items-center p-2 bg-red-100 text-red-600">
          <img src="/report-issue.svg" alt="Warning" className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      <form className="w-4/5 flex items-center p-4 bg-white text-black">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn của bạn"
          rows={1}
          className="flex-grow border-2 border-gray-300 p-2 rounded"
          onKeyDown={handleKeyDown}
          required
        />
        <button type="button" onClick={handleSendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded">Gửi</button>
      </form>
    </div>
  );
}

export default InputMessage;