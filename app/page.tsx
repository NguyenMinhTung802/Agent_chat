"use client";

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import InputMessage from './components/InputMessage';
import Chat from './components/Chat';
import Landing from './components/Landing';
import ListAgent from './components/ListAgent';
import { sendMessageToAPI, fetchMessagesFromFile, createNewConversationFile, setBaseDirectoryHandle, updateConversationFile, getAgentsFromFile, loadAgentsDict } from './api/api';

interface Message {
    sender: 'user' | 'agent';
    text: string;
}

interface Conversation {
    key: string;
    title: string;
    latestAgent: string;
    conversationId: string;
    messages: Message[];
}

// Dictionary để lưu trữ API và syntax
let agentsDict: { [key: string]: string } = {};

const ChatPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentChat, setCurrentChat] = useState<string>(''); 
    const [currentAgent, setCurrentAgent] = useState<string>(''); 
    const [loading, setLoading] = useState<boolean>(false); 
    const [landing, setLanding] = useState<boolean>(true); 
    const [folderSelected, setFolderSelected] = useState<boolean>(false); 
    const [showAgentList, setShowAgentList] = useState<boolean>(false);

    const loadAgents = async () => {
        const agentsData = await getAgentsFromFile(); // Lấy agents từ file
        agentsData.forEach(agent => {
            agentsDict[agent.syntax] = agent.apiKey; // Thiết lập syntax làm key và apiKey là giá trị
        });
        console.log("Agents loaded:", agentsDict);
        loadAgentsDict()
    };

    const handleSelectDirectory = async () => {
        try {
            const directoryHandle = await window.showDirectoryPicker();
            setBaseDirectoryHandle(directoryHandle);
            setFolderSelected(true);
            console.log("Selected directory:", directoryHandle);

            // Gọi hàm loadAgents sau khi chọn thư mục
            await loadAgents();
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
        setCurrentAgent(getDefaultAgent());
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
        setMessages([...messages, { sender: 'user', text: message }]);
        const { text: processedMessage, agent: newAgent } = processMessage(message);
        const userMessage: Message = { sender: 'user', text: message };
        try {
            const responseData = await sendMessageToAPI(processedMessage, "", newAgent);
            const parts = responseData.split('\n\ndata: ');

            let agentThoughts: Message[] = [];

            parts.forEach((part: string) => {
                try {
                    let cleanedPart = part.trim();
                    if (cleanedPart.startsWith('{') && cleanedPart.endsWith('}')) {
                        cleanedPart = cleanedPart.replace(/^data:\s*/, '');
                        const jsonPart = JSON.parse(cleanedPart);

                        if (jsonPart.event === "agent_thought") {
                            const thought = jsonPart.thought || jsonPart.answer;
                            if (thought) {
                                agentThoughts.push({ sender: 'agent', text: thought });
                            }
                        }
                    }
                } catch (jsonError) {
                    console.error(`Failed to parse JSON: ${jsonError}`);
                }
            });
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
            const newConversation: Conversation = {
                key: chatKey,
                title: conversationTitle,
                latestAgent: newAgent,
                conversationId: '',
                messages: [...messages, userMessage, ...agentThoughts]
            };

            await createNewConversationFile(newConversation);
            setConversations([...conversations, newConversation]);
            handleConversationClick(chatKey);
            setLanding(false);

        } catch (error) {
            console.error('Error sending the first message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConversationClick = (key: string) => {
        setCurrentChat(key);
        setLanding(false);
        fetchMessages(key);
    };

    const processMessage = (message: string): { text: string; agent: string } => {
        let newAgent = currentAgent;
        let syntax = '';

        if (message.startsWith('@')) {
            const syntaxMatch = message.match(/^@([^:]+)/);
            if (syntaxMatch && agentsDict[syntaxMatch[1]]) {
                newAgent = syntaxMatch[1];
                syntax = syntaxMatch[1];
                message = message.replace(`@${newAgent}:`, '').trim();
            }
        }

        setCurrentAgent(newAgent);
        return { text: message, agent: syntax || newAgent };
    };

    const handleSendMessage = async (message: string) => {
        if (landing) {
            await handleFirstMessage(message); 
        } else {
            setMessages(prevMessages => [...prevMessages, { sender: 'user', text: message }]);
            const { text: processedMessage, agent: newAgent } = processMessage(message);
            setLoading(true);
            try {
                const responseData = await sendMessageToAPI(processedMessage, "", newAgent);
                const parts = responseData.split('\n\ndata: ');

                let agentThought: Message | null = null;

                for (const part of parts) {
                    try {
                        let cleanedPart = part.trim();
                        if (cleanedPart.startsWith('{') && cleanedPart.endsWith('}')) {
                            cleanedPart = cleanedPart.replace(/^data:\s*/, '');
                            const jsonPart = JSON.parse(cleanedPart);

                            if (jsonPart.event === "agent_thought") {
                                const thought = jsonPart.thought || jsonPart.answer;
                                if (thought) {
                                    agentThought = { sender: 'agent', text: thought };
                                }
                            }
                        }
                    } catch (jsonError) {
                        console.error(`Failed to parse JSON: ${jsonError} -- Raw part: ${part}`);
                    }
                }

                if (agentThought) {
                    setMessages(prevMessages => [...prevMessages, agentThought]);
                    await updateConversationFile(currentChat, [...messages, { sender: 'user', text: message }, agentThought]);
                }

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
                handleNewConversation();
            } else {
                handleNewConversation(); 
                setCurrentChat('');
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
        setShowAgentList(true); 
        setLanding(false);
        setCurrentChat('');
    };

    const currentConversation = conversations.find(conv => conv.key === currentChat);
    const title = showAgentList ? 'Your AI agent list' : currentConversation ? currentConversation.title : 'New Conversation';

    const getDefaultAgent = (): string => {
        const pinnedAgents = Object.keys(agentsDict).filter(agentSyntax => {
            return conversations.some(conv => conv.latestAgent === agentSyntax); // Điều kiện lọc
        });

        // Nếu không có agent được pin, lấy agent đầu tiên trong danh sách
        if (pinnedAgents.length > 0) {
            return pinnedAgents[0]; // Trả về agent được pin đầu tiên
        }

        // Lấy danh sách tất cả agents
        const allAgents = Object.keys(agentsDict);
        
        // Nếu không agent nào có sẵn, trả về một chuỗi rỗng hoặc giá trị mặc định khác
        return allAgents.length > 0 ? allAgents[0] : ''; // Hoặc có thể là một giá trị mặc định khác
    };

    return (
        <div className="flex h-screen bg-white text-black">
            <Sidebar 
                conversations={conversations}
                currentChat={currentChat}
                onNewConversation={handleNewConversation}
                onConversationClick={handleClick}
                onDeleteConversation={handleDeleteConversation}
                onEditConversation={handleEditConversation}
                onShowAgentList={handleShowAgentList}
            />
            <div className="flex flex-col w-full h-screen overflow-hidden">
                {showAgentList ? (
                    <ListAgent/>
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