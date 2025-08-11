"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import InputMessage from './components/InputMessage';
import Chat from './components/Chat';
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<{ id: string; title: string }[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    handleNewConversation();
  }, []);

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await axios.get(`https://api.oriagent.com/v1/messages?user=abc-123&conversation_id=${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const messagesList: Message[] = [];
      res.data.data.forEach((msg: { query: string; agent_thoughts: { thought: string }[] }) => {
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
    const emptyConversation = conversations.find(conv => conv.id === '');

    if (emptyConversation) {
        // Nếu đã có cuộc hội thoại trống, thiết lập currentConversationId thành conversationId trống
        setCurrentConversationId(emptyConversation.id);
        setMessages([]);
        return; // Ngăn chặn tạo cuộc trò chuyện mới
    }

    // Tạo cuộc hội thoại mới nếu không có cuộc hội thoại trống
    const newConversationId = ''; 
    setConversations([...conversations, { id: newConversationId, title: `Cuộc trò chuyện mới` }]);
    setCurrentConversationId(newConversationId);
    setMessages([]);
  };

  const handleConversationClick = (id: string) => {
    setCurrentConversationId(id);
    fetchMessages(id);
  };

  const handleSendMessage = async (message: string) => {
    setMessages([...messages, { sender: 'user', text: message }]);

    const payload = {
        inputs: {},
        query: message,
        response_mode: 'streaming',
        conversation_id: currentConversationId,
        user: 'abc-123',
        files: [
            {
                type: 'image',
                transfer_method: 'remote_url',
                url: 'https://cloud.oriagent.com/logo/logo-site.png'
            }
        ]
    };

    try {
        const response = await axios.post('https://api.oriagent.com/v1/chat-messages', payload, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const parts = response.data.split('\n\ndata: ');
        let newConversationId: string = ''; 

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

                if (jsonPart.conversation_id) {
                    newConversationId = jsonPart.conversation_id;
                }

            } catch (jsonError) {
                console.error("Failed to parse JSON:", jsonError);
            }
        });

        if (newConversationId) {
            setCurrentConversationId(newConversationId);
            setConversations(prevConversations => 
                prevConversations.map(conv => 
                    conv.id === '' ? { ...conv, id: newConversationId } : conv
                    )
            );

            fetchMessages(newConversationId);
        }

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('AxiosError:', error.response?.data);
        } else {
            console.error('Error sending message:', error);
        }
    }
  };

  const handleDeleteConversation = (id: string) => {
  // Lưu lại trạng thái của cuộc hội thoại hiện tại
  const wasCurrentConversation = id === currentConversationId;

  // Xóa cuộc hội thoại khỏi danh sách các cuộc hội thoại
  const updatedConversations = conversations.filter(conv => conv.id !== id);
  setConversations(updatedConversations);

  if (wasCurrentConversation) {
    // Nếu cuộc hội thoại bị xóa là cuộc hội thoại hiện tại
    if (currentConversationId === '') {
      // Nếu currentConversationId đang trống, tạo cuộc trò chuyện mới
      handleNewConversation();
    } else {
      // Nếu không, tạo cuộc trò chuyện mới mặc định
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
  // Lấy tiêu đề của cuộc trò chuyện hiện tại
  const currentConversation = conversations.find(conv => conv.id === currentConversationId);
  const title = currentConversation ? currentConversation.title : 'Cuộc trò chuyện mới'; // Nếu không có cuộc trò chuyện nào, hiển thị tiêu đề mặc định

  return (
    <div className="flex h-screen bg-white text-black">
      <Sidebar 
  conversations={conversations}
  currentConversationId={currentConversationId}
  onNewConversation={handleNewConversation}
  onConversationClick={handleConversationClick}
  onDeleteConversation={handleDeleteConversation}
  onEditConversation={handleEditConversation} // Thêm prop này
/>
      <div className="flex flex-col w-4/5">
        <Header title={title} /> {/* Sử dụng tiêu đề đã lấy ở trên */}
        <Chat messages={messages} />
        <InputMessage onSend={handleSendMessage} />
      </div>
    </div>
  );
}

export default ChatPage;