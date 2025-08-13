"use client";
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import InputMessage from './components/InputMessage';
import Chat from './components/Chat';
import Landing from './components/Landing';
import { sendMessageToAPI, fetchMessagesFromAPI } from './api/api';

interface Message {
    sender: 'user' | 'agent';
    text: string;
}

const ChatPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<{ id: string; title: string }[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false); 
    const [landing, setLanding] = useState<boolean>(false); // Đặt trạng thái landing mặc định là false

    useEffect(() => {
        // Khi mở trang web, đặt landing là true
        setLanding(true);
    }, []);

    const fetchMessages = async (conversationId: string) => {
        try {
            const messagesData = await fetchMessagesFromAPI(conversationId); // Gọi hàm mới từ api.ts
            const messagesList: Message[] = [];
            messagesData.forEach((msg: { query: string; agent_thoughts: { thought: string }[] }) => {
                messagesList.push({
                    sender: 'user',
                    text: msg.query,
                });
                messagesList.push({
                    sender: 'agent',
                    text: msg.agent_thoughts.length > 0 ? msg.agent_thoughts[0].thought : '',
                });
            });
            setMessages(messagesList);
        } catch (error) {
            console.error('Error fetching message history:', error);
        }
    };

    const handleNewConversation = () => {
        setLanding(true); 
    };

    const handleFirstMessage = async (message: string) => {
        setLoading(true);
        let conversationId = "";
        try {
            const responseData = await sendMessageToAPI(message, conversationId); // Gọi hàm sendMessageToAPI

            const parts = responseData.split('\n\ndata: ');
            parts.forEach((part: string) => {
                try {
                    const cleanedPart = part.replace(/^data:\s*/, '');
                    const jsonPart = JSON.parse(cleanedPart);
                    
                    if (jsonPart.conversation_id) {
                        conversationId = jsonPart.conversation_id; // Lưu conversationId
                    }
                } catch (jsonError) {
                    console.error("Failed to parse JSON:", jsonError);
                }
            });

            // Tạo cuộc trò chuyện mới
            if (conversationId) {
                setConversations([...conversations, { id: conversationId, title: `Cuộc trò chuyện mới` }]);
                handleConversationClick(conversationId); // Chuyển sang đoạn chat mới
                setLanding(false); // Đặt landing thành false sau khi tạo cuộc trò chuyện mới
            }
        setLoading(false);

        } catch (error) {
            console.error('Error sending first message:', error);
        }
    };

    const handleConversationClick = (id: string) => {
        setCurrentConversationId(id);
        fetchMessages(id);
    };

    const handleSendMessage = async (message: string) => {
        if (landing) {
            handleFirstMessage(message); // Gọi hàm handleFirstMessage khi đang ở landing
        } else {
            setMessages([...messages, { sender: 'user', text: message }]);
            setLoading(true); // Bắt đầu loading
            let conversation_id = currentConversationId
            // Gọi hàm gửi tin nhắn ở đây
            try {
                const responseData = await sendMessageToAPI(message, conversation_id);

                const parts = responseData.split('\n\ndata: ');
                parts.forEach((part: string) => {
                    try {
                        const cleanedPart = part.replace(/^data:\s*/, '');
                        const jsonPart = JSON.parse(cleanedPart);

                        if (jsonPart.event === "agent_thought") {
                            const thought = jsonPart.thought;
                            if (thought) {
                                setMessages(prevMessages => [...prevMessages, { sender: 'agent', text: thought }]);
                            }
                        }
                    } catch (jsonError) {
                        console.error("Failed to parse JSON:", jsonError);
                    }
                });
                setLoading(false); // Dừng loading khi có phản hồi
            } catch (error) {
                setLoading(false); // Dừng loading nếu có lỗi
                console.error('Error sending message:', error);
            }
        }
    };

    const handleDeleteConversation = (id: string) => {
        const wasCurrentConversation = id === currentConversationId;

        const updatedConversations = conversations.filter(conv => conv.id !== id);
        setConversations(updatedConversations);

        if (wasCurrentConversation) {
            if (currentConversationId === '') {
                handleNewConversation();
            } else {
                handleNewConversation();
                setCurrentConversationId(''); 
            }
        }
    };

    const handleEditConversation = (id: string, newTitle: string) => {
        setConversations(prevConversations => 
            prevConversations.map(conv => 
                conv.id === id ? { ...conv, title: newTitle } : conv
            )
        );
    };

    const currentConversation = conversations.find(conv => conv.id === currentConversationId);
    const title = currentConversation ? currentConversation.title : 'Cuộc trò chuyện mới';

    return (
        <div className="flex h-screen bg-white text-black">
            <Sidebar 
                conversations={conversations}
                currentConversationId={currentConversationId}
                onNewConversation={handleNewConversation}
                onConversationClick={handleConversationClick}
                onDeleteConversation={handleDeleteConversation}
                onEditConversation={handleEditConversation}
            />
            <div className="flex flex-col w-full">
                <Header title={title} />
                <div className="flex flex-col w-full overflow-y-auto ">
                    {landing ? ( // Thay thế Chat bằng Landing khi trạng thái landing là true
                        <Landing loading={loading} />
                    ) : (
                        <Chat messages={messages} loading={loading} />
                    )}
                    <InputMessage onSend={handleSendMessage} /> {/* Luôn hiển thị InputMessage */}
                </div>
            </div>
        </div>
    );
}

export default ChatPage;