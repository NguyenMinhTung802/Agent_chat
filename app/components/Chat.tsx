import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import BounceLoader from './BounceLoader'; // Nhập hiệu ứng loader

interface Message {
    sender: 'user' | 'agent';
    text: string;
}

interface ChatProps {
    messages: Message[];
    loading: boolean; // Thêm prop loading
}

const Chat: React.FC<ChatProps> = ({ messages, loading }) => {
    const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="w-1/2 mx-auto flex-grow p-4 text-black">
            {messages.map((msg, index) => (
                <div key={`${msg.sender}-${index}`} className={`mb-2 ${msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                    {msg.sender === 'agent' && (
                        <div className="flex-shrink-0"> {/* Thêm div này để cố định kích thước của icon */}
                            <Image 
                                src="/bot_avatar.png" 
                                alt="AI Bot"
                                width={40}
                                height={40}
                            />
                        </div>
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
            {loading && ( // Hiển thị loader khi loading là true
                <div className="flex justify-start my-4"> {/* Chỉnh tiêu chí căn trái */}
                    <div className="mr-2 flex-shrink-0"> {/* Thêm div này để cố định kích thước của icon */}
                        <Image 
                            src="/bot_avatar.png" 
                            alt="AI Bot"
                            width={40}
                            height={40}
                        />
                    </div>
                    <BounceLoader /> 
                </div>
            )}
            <div ref={endOfMessagesRef} />
        </div>
    );
}

export default Chat;