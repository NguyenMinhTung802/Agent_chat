"use client";
import React, { useState, useRef } from 'react';
import { ArrowUp, Paperclip, StopCircle, Mic } from "lucide-react"; // Nhập các icon từ lucide-react

interface InputMessageProps {
  onSend: (message: string) => void;
}

const InputMessage: React.FC<InputMessageProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false); // Trạng thái ghi âm
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Ngăn chặn việc tạo dòng mới
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim() === '') {
      setError('Lời nhắn là bắt buộc');
      setTimeout(() => {
        setError('');
      }, 1000);
      return; // Ngăn chặn gửi tin nhắn trống
    }
    setError(''); // Xóa thông báo lỗi nếu có
    onSend(message);
    setMessage('');
    
    // Khôi phục chiều cao của textarea về kích thước mặc định
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = '44px'; // Chiều cao mặc định
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, window.innerHeight / 3)}px`;  // Giới hạn chiều cao tối đa là 1/3 màn hình
    }
  };

  const handleStartRecording = () => {
    console.log("Started recording");
  };

  const handleStopRecording = (duration: number) => {
    console.log(`Stopped recording after ${duration} seconds`);
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col justify-end items-center h-screen bg-white sticky bottom-0 pb-5 z-10"> {/* Căn giữa theo chiều rộng và ở dưới cùng */}
      <div className="flex flex-col w-1/2 bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300">
        {error && (
          <div className="p-2 bg-red-400 rounded-lg text-white text-center mb-2">
            <span>{error}</span>
          </div>
        )}
        <div className="flex items-center">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            placeholder="Ask anything"
            rows={1}
            className="flex-grow bg-transparent px-3 py-2.5 text-base text-black placeholder:text-gray-400 resize-none max-h-[33vh] focus:outline-none" // Giới hạn chiều cao tối đa là 1/3 chiều cao màn hình
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-400 text-white hover:bg-gray-500 transition-colors"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
        <div className="flex justify-between mt-2">
          <button
            className="flex items-center gap-2 text-gray-400 hover:text-black"
            onClick={() => console.log("Open file upload")} // Place holder function
          >
            <Paperclip className="h-5 w-5" />
            <span className="hover:text-black">Upload file</span>
          </button>
          <button
            className="flex items-center gap-2 text-gray-400 hover:text-black"
            onClick={() => {
              setIsRecording(!isRecording);
              if (!isRecording) {
                handleStartRecording();
              } else {
                handleStopRecording(0); // Gọi hàm dừng ghi âm với thời gian 0
              }
            }}
          >
            {isRecording ? (
              <StopCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputMessage;