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
        setCurrentConversationId('');
    };

    const handleFirstMessage = async (message: string) => {
    setLoading(true);
    let conversationId = "";
    try {
        // Gửi tin nhắn đầu tiên đến API để nhận conversation_id
        const responseData = await sendMessageToAPI(message, ""); // conversationId mặc định là rỗng
        const parts = responseData.split('\n\ndata: ');

        parts.forEach((part: string) => {
            try {
                let cleanedPart = part.trim(); // Xóa khoảng trắng dư thừa
                if (cleanedPart.startsWith('{') && cleanedPart.endsWith('}')) { // Kiểm tra xem phần có định dạng JSON hợp lệ không
                    cleanedPart = cleanedPart.replace(/^data:\s*/, '');
                    const jsonPart = JSON.parse(cleanedPart);

                    if (jsonPart.conversation_id) {
                        conversationId = jsonPart.conversation_id; // Gán giá trị cho conversationId
                    }
                }
            } catch (jsonError) {
                console.error(`Failed to parse JSON in handleFirstMessage: ${jsonError} -- Raw part: ${part}`);
            }
        });

        // Lấy tên cuộc trò chuyện
        let conversationTitle = ''; // Khởi tạo title ở đây
        const titleResponse = await sendMessageToAPI('Dựa trên nội dung của tin nhắn đầu tiên, tạo một tiêu đề ngắn gọn (tối đa 10 từ), giữ nguyên ngôn ngữ và giọng điệu của tin nhắn. Tiêu đề phải phản ánh chính xác ý chính, không thêm hoặc suy đoán ngoài nội dung. Khi trả lời, chỉ xuất tên cuộc trò chuyện, không kèm giải thích. Đây là tin nhắn đầu tiên: ' + message, ''); // Gửi API để lấy title
        const titleParts = titleResponse.split('\n\ndata: ');

        titleParts.forEach((part: string) => {
            try {
                let cleanedTitlePart = part.trim(); // Xóa khoảng trắng dư thừa
                if (cleanedTitlePart.startsWith('{') && cleanedTitlePart.endsWith('}')) { // Kiểm tra xem phần có định dạng JSON hợp lệ không
                    cleanedTitlePart = cleanedTitlePart.replace(/^data:\s*/, '');
                    const jsonTitlePart = JSON.parse(cleanedTitlePart);

                    if (jsonTitlePart.event === "agent_thought") {
                        const thought = jsonTitlePart.thought;
                        if (thought) {
                            conversationTitle = thought; // Lưu thought vào title
                        }
                    }
                }
            } catch (jsonError) {
                console.error(`Failed to parse JSON in conversation title response: ${jsonError} -- Raw part: ${part}`);
            }
        });

        // Tạo cuộc trò chuyện mới
        if (conversationId) {
            setConversations([...conversations, { id: conversationId, title: conversationTitle }]);
            handleConversationClick(conversationId); // Chuyển sang đoạn chat mới
            setLanding(false); // Đặt landing thành false sau khi tạo cuộc trò chuyện mới
        }
    } catch (error) {
        console.error('Error sending the first message:', error);
    } finally {
        setLoading(false);
    }
};

    const handleConversationClick = (id: string) => {
    setCurrentConversationId(id);
    setLanding(false); // Đặt landing thành false
    fetchMessages(id);
};
    const handleSendMessage = async (message: string) => {
        if (landing) {
            handleFirstMessage(message);
        } else {
            setMessages([...messages, { sender: 'user', text: message }]);
            setLoading(true);
            let conversation_id = currentConversationId;

            try {
            const responseData = await sendMessageToAPI(message, conversation_id);
            const parts = responseData.split('\n\ndata: ');

            parts.forEach((part: string) => {
                try {
                let cleanedPart = part.trim(); // Xóa khoảng trắng dư thừa
                if (cleanedPart.startsWith('{') && cleanedPart.endsWith('}')) { // Kiểm tra xem đây có phải là JSON không
                    cleanedPart = cleanedPart.replace(/^data:\s*/, '');
                    const jsonPart = JSON.parse(cleanedPart);

                    if (jsonPart.event === "agent_thought") {
                    const thought = jsonPart.thought || jsonPart.answer;
                    if (thought) {
                        setMessages(prevMessages => [...prevMessages, { sender: 'agent', text: thought }]);
                    }
                    }
                }
                } catch (jsonError) {
                console.error(`Failed to parse JSON: ${jsonError} -- Raw part: ${part}`);
                }
            });
            setLoading(false);
            } catch (error) {
            setLoading(false);
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
    <div className="flex flex-col w-full h-screen overflow-hidden">
        <Header title={title} />
        <div className="flex flex-col w-full h-full overflow-y-auto"> 
            {landing ? (
                <Landing loading={loading} />
            ) : (
                <Chat messages={messages} loading={loading} />
            )}
            <InputMessage onSend={handleSendMessage} />
        </div>
    </div>
  </div>
);
}

export default ChatPage;