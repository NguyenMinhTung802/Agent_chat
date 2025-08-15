"use client";
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import InputMessage from './components/InputMessage';
import Chat from './components/Chat';
import Landing from './components/Landing';
import ListAgent from './components/ListAgent'; // Nhập component ListAgent
import { sendMessageToAPI, fetchMessagesFromFile, createNewConversationFile, setBaseDirectoryHandle } from './api/api';

interface Message {
    sender: 'user' | 'agent'; // Đảm bảo kiểu sender
    text: string;
}

interface Conversation {
    key: string;
    title: string;
    latestAgent: string;
    conversationId: string;
    messages: Message[]; // Đảm bảo messages là kiểu Message[]
}

const ChatPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentChat, setCurrentChat] = useState<string>(''); 
    const [currentAgent, setCurrentAgent] = useState<string>('director'); 
    const [loading, setLoading] = useState<boolean>(false); 
    const [landing, setLanding] = useState<boolean>(true); 
    const [folderSelected, setFolderSelected] = useState<boolean>(false); 
    const [showAgentList, setShowAgentList] = useState<boolean>(false); // Thêm state mới để theo dõi việc hiển thị danh sách agent

    const handleSelectDirectory = async () => {
        try {
            const directoryHandle = await window.showDirectoryPicker();
            setBaseDirectoryHandle(directoryHandle);
            setFolderSelected(true); // Đánh dấu là đã chọn thư mục
            console.log("Selected directory:", directoryHandle);
        } catch (error) {
            console.error('Error selecting directory:', error);
        }
    };

    const fetchMessages = async (chatKey: string) => {
        const messagesData = await fetchMessagesFromFile(chatKey);
        setMessages(messagesData.messages); 
        setCurrentAgent(messagesData.latestAgent); 
    };

    const handleNewConversation = () => {
        setLanding(true); 
        setCurrentAgent('director');
        setMessages([]);
        setCurrentChat('');
        setShowAgentList(false);
    };

    const handleClick = async (key: string) => {
        const conversation = conversations.find(conv => conv.key === key);
        if (conversation) {
            await fetchMessages(conversation.key);
            setCurrentChat(key); 
            setLanding(false);
            setShowAgentList(false);
        }
    };

    const handleFirstMessage = async (message: string) => {
        setLoading(true);
        let chatKey = generateRandomKey();
        console.log("Agent trong page trước process", currentAgent);

        // Thêm tin nhắn user vào danh sách
        setMessages([...messages, { sender: 'user', text: message }]);

        // Xử lý tin nhắn và lấy agent mới
        const { text: processedMessage, agent: newAgent } = processMessage(message);

        console.log("Agent sau khi process", newAgent);
        const userMessage: Message = { sender: 'user', text: message };
        try {
            const responseData = await sendMessageToAPI(processedMessage, "", newAgent);
            const parts = responseData.split('\n\ndata: ');

            let agentThoughts: Message[] = []; // Sử dụng kiểu Message cho agentThoughts

            parts.forEach((part: string) => {
                try {
                    let cleanedPart = part.trim();
                    if (cleanedPart.startsWith('{') && cleanedPart.endsWith('}')) {
                        cleanedPart = cleanedPart.replace(/^data:\s*/, '');
                        const jsonPart = JSON.parse(cleanedPart);
                        
                        if (jsonPart.event === "agent_thought") {
                            const thought = jsonPart.thought || jsonPart.answer;
                            if (thought) {
                                agentThoughts.push({ sender: 'agent', text: thought }); // Đảm bảo kiểu dữ liệu chính xác
                            }
                        }
                    }
                } catch (jsonError) {
                    console.error(`Failed to parse JSON: ${jsonError}`);
                }
            });

            // Cập nhật tin nhắn của agent khi nhận được phản hồi
            if (agentThoughts.length > 0) {
                setMessages(prevMessages => [...prevMessages, ...agentThoughts]);
            }

            // Tiêu đề cuộc trò chuyện
            let conversationTitle = '';
            const titleResponse = await sendMessageToAPI("Dựa trên nội dung của tin nhắn đầu tiên, tạo một tiêu đề ngắn gọn (tối đa 10 từ), giữ nguyên ngôn ngữ và giọng điệu của tin nhắn. Tiêu đề phải phản ánh chính xác ý chính, không thêm hoặc suy đoán ngoài nội dung và có ngôn ngữ trùng với ngôn ngữ của tin nhắn. Khi trả lời, chỉ xuất tên cuộc trò chuyện, không kèm giải thích. Đây là tin nhắn đầu tiên: " + processedMessage, "", newAgent);
            const titleParts = titleResponse.split('\n\ndata: ');

            titleParts.forEach((part: string) => {
                try {
                    let cleanedTitlePart = part.trim();
                    if (cleanedTitlePart.startsWith('{') && cleanedTitlePart.endsWith('}')) {
                        cleanedTitlePart = cleanedTitlePart.replace(/^data:\s*/, '');
                        const jsonTitlePart = JSON.parse(cleanedTitlePart);
                        if (jsonTitlePart.event === "agent_thought") {
                            const thought = jsonTitlePart.thought;
                            if (thought) {
                                conversationTitle = thought; 
                            }
                        }
                    }
                } catch (jsonError) {
                    console.error(`Failed to parse JSON for title: ${jsonError}`);
                }
            });

            // Cập nhật tiêu đề cho cuộc trò chuyện
            const newConversation: Conversation = {
                key: chatKey,
                title: conversationTitle,
                latestAgent: newAgent,
                conversationId: '',
                messages: [...messages, userMessage, ...agentThoughts] // Sử dụng agentThoughts đã được xác định kiểu
            };

            // Gọi createNewConversationFile để tạo file mới sau khi có tiêu đề
            await createNewConversationFile(newConversation);
            // Tạo cuộc trò chuyện mới trong state
            setConversations([...conversations, newConversation]);
            handleConversationClick(chatKey); // Chuyển sang đoạn chat mới
            setLanding(false); // Đặt landing thành false sau khi tạo cuộc trò chuyện mới

        } catch (error) {
            console.error('Error sending the first message:', error);
        } finally {
            setLoading(false);
        }
    };    

    const handleConversationClick = (key: string) => {
        setCurrentChat(key);
        setLanding(false); // Đặt landing thành false
        fetchMessages(key);
    };

    const processMessage = (message: string): { text: string; agent: string } => {
        let newAgent = currentAgent;

        if (message.startsWith('@giamdoc:')) {
            newAgent = 'director';
            message = message.replace('@giamdoc:', '').trim();
        } else if (message.startsWith('@ketoan:')) {
            newAgent = 'accountant';
            message = message.replace('@ketoan:', '').trim();
        } else if (message.startsWith('@troly:')) {
            newAgent = 'secretary';
            message = message.replace('@troly:', '').trim();
        }

        // Cập nhật state cho React
        setCurrentAgent(newAgent);

        console.log("Current agent set to", newAgent);

        return { text: message, agent: newAgent };
    };

    const handleSendMessage = async (message: string) => {
        if (landing) {
            handleFirstMessage(message);
        } else {
            console.log("Agent trong page trước process", currentAgent);

            // Thêm tin nhắn user vào danh sách
            setMessages([...messages, { sender: 'user', text: message }]);

            // Xử lý tin nhắn và lấy agent mới
            const { text: processedMessage, agent: newAgent } = processMessage(message);

            console.log("Agent sau khi process", newAgent);
            setLoading(true);
            try {
                const responseData = await sendMessageToAPI(processedMessage, "", newAgent);
                const parts = responseData.split('\n\ndata: ');

                parts.forEach((part: string) => {
                    try {
                        let cleanedPart = part.trim(); // Xóa khoảng trắng dư thừa
                        if (cleanedPart.startsWith('{') && cleanedPart.endsWith('}')) {
                            cleanedPart = cleanedPart.replace(/^data:\s*/, '');
                            const jsonPart = JSON.parse(cleanedPart);

                            if (jsonPart.event === "agent_thought") {
                                const thought = jsonPart.thought || jsonPart.answer;
                                if (thought) {
                                    setMessages(prevMessages => [
                                        ...prevMessages,
                                        { sender: 'agent', text: thought }
                                    ]);
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

    const handleDeleteConversation = (key: string) => {
        const wasCurrentConversation = key === currentChat;

        const updatedConversations = conversations.filter(conv => conv.key !== key);
        setConversations(updatedConversations);

        if (wasCurrentConversation) {
            if (currentChat === '') {
                handleNewConversation(); // Nếu không có cuộc trò chuyện nào, tạo mới
            } else {
                handleNewConversation(); // Tạo cuộc trò chuyện mới
                setCurrentChat(''); // Đặt lại mã cuộc trò chuyện hiện tại
            }
        }
    };

    const handleEditConversation = (key: string, newTitle: string) => {
        setConversations(prevConversations => 
            prevConversations.map(conv => 
                conv.key === key ? { ...conv, title: newTitle } : conv
            )
        );
    };

    const handleShowAgentList = () => {
        setShowAgentList(true); // Chuyển sang chế độ hiển thị danh sách agent
        setLanding(false); // Để không hiển thị Landing
        setCurrentChat(''); // Đặt lại mã cuộc trò chuyện hiện tại
    };

    const currentConversation = conversations.find(conv => conv.key === currentChat);
    const title = showAgentList ? 'Your AI agent list' : currentConversation ? currentConversation.title : 'New Conversation';

    return (
        <div className="flex h-screen bg-white text-black">
            <Sidebar 
                conversations={conversations}
                currentChat={currentChat}
                onNewConversation={handleNewConversation}
                onConversationClick={handleClick}
                onDeleteConversation={handleDeleteConversation}
                onEditConversation={handleEditConversation}
                onShowAgentList={handleShowAgentList} // Truyền hàm cho Sidebar
            />
            <div className="flex flex-col w-full h-screen overflow-hidden">
                {showAgentList ? (
                    <ListAgent /> // Loại bỏ onSearch
                ) : (
                    <Header title={title} />
                )}
                <div className="flex flex-col w-full h-full overflow-y-auto"> 
                    {landing ? (
                        <Landing loading={loading} />
                    ) : !showAgentList ? (
                        <Chat messages={messages} loading={loading} />
                    ) : null}
                    {!showAgentList && <InputMessage onSend={handleSendMessage} />}
                </div>
                {!folderSelected && ( 
                    <button 
                        onClick={handleSelectDirectory}
                        className="p-2 bg-blue-500 text-white rounded">
                        Select root directory
                    </button>
                )}
            </div>
        </div>
    );
}

const generateRandomKey = () => {
    return 'xxxxxxxyxxxxxxx'.replace(/x/g, function () {
        return (Math.random() * 16 | 0).toString(16);
    });
};

export default ChatPage;