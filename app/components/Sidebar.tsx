"use client";
import React, { useState } from "react";
import Image from "next/image";

interface Message {
    sender: 'user' | 'agent';
    text: string;
}

interface Conversation {
    key: string; // Changed from 'id' to 'key'
    title: string;
    latestAgent: string;
    conversationId: string;
    messages: Message[];
}

interface SidebarProps {
    conversations: Conversation[];
    currentChat: string;
    onNewConversation: () => void;
    onConversationClick: (key: string) => void; // Changed from id to key
    onDeleteConversation: (key: string) => void; // Changed from id to key
    onEditConversation: (key: string, newTitle: string) => void; // Changed from id to key
    onShowAgentList: () => void; // Thêm props mới để xử lý hiện danh sách agent
}

const Sidebar: React.FC<SidebarProps> = ({
    conversations,
    currentChat,
    onNewConversation,
    onConversationClick,
    onDeleteConversation,
    onEditConversation,
    onShowAgentList // Thêm props mới
}) => {
    const [hoveredConversationKey, setHoveredConversationKey] = useState<string | null>(null);
    const [menuOpenKey, setMenuOpenKey] = useState<string | null>(null); // Changed from id to key
    const [editTitle, setEditTitle] = useState<string>(""); 
    const [isEditingKey, setIsEditingKey] = useState<string | null>(null); // Changed from id to key 
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true); // Trạng thái để theo dõi sidebar
    const [isAgentListSelected, setIsAgentListSelected] = useState<boolean>(false); // Trạng thái để theo dõi việc chọn danh sách agent

    const handleEdit = (key: string) => {
        onEditConversation(key, editTitle);
        setEditTitle(""); 
        setIsEditingKey(null); 
        setMenuOpenKey(null);
    };

    const handleDelete = (key: string) => {
        onDeleteConversation(key);
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
        key: string
    ) => {
        if (event.key === "Enter") {
            handleEdit(key);
        }
    };

    return (
        <div className={`h-screen max-h-screen sticky top-0 transition-width duration-300 bg-gray-50 flex flex-col text-black ${isSidebarOpen ? 'w-1/6 z-20' : 'w-[60px]'}`}>
            {isSidebarOpen ? (
                <>
                    <div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center justify-center hover:bg-gray-100 rounded-lg m-2 p-2"
                        >
                            <Image
                                src="/sidebar_colapse.svg"
                                alt="Đóng thanh bên"
                                width={20}
                                height={20}
                            />
                        </button>
                    </div>
                    <button
                        onClick={onNewConversation}
                        className="flex items-center hover:bg-gray-100 rounded-lg m-2 p-2"
                    >
                        <Image
                            src="/add-note.svg"
                            alt="Cuộc trò chuyện mới"
                            width={20}
                            height={20}
                        />
                        <span>New Conversation</span>
                    </button>
                    <button
                        onClick={() => {
                            setIsAgentListSelected(true);
                            onShowAgentList(); // Gọi hàm để hiển thị danh sách agent
                        }}
                        className={`flex items-center ${isAgentListSelected ? "bg-gray-100" : ""} rounded-lg m-2 p-2`} // Thay đổi màu nền nếu danh sách agent được chọn
                    >
                        <Image
                            src="/agent_list.svg"
                            alt="Danh sách agent"
                            width={20}
                            height={20}
                        />
                        <span>List your AI agent</span>
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="flex items-center w-full justify-center hover:bg-gray-100 rounded-lg m-2 p-2"
                    >
                        <Image
                            src="/sidebar_colapse.svg" // Đường dẫn đến icon mở
                            alt="Mở thanh bên"
                            width={20}
                            height={20}
                        />
                    </button>
                    <button
                        onClick={onNewConversation}
                        className="flex items-center w-full justify-center hover:bg-gray-100 rounded-lg m-2 p-2"
                    >
                        <Image
                            src="/add-note.svg"
                            alt="Cuộc trò chuyện mới"
                            width={20}
                            height={20}
                        />
                    </button>
                </>
            )}

            {isSidebarOpen && (
                <div className="flex flex-col mt-[30%]">
                    <h2 className="p-4 text-left font-bold">Conversations</h2>
                    <div className="overflow-y-auto flex-grow">
                        {conversations.map((conv) => (
                            <div
                                key={conv.key} // Use key instead of id
                                className={`p-2 m-2 cursor-pointer flex justify-between items-center ${currentChat === conv.key ? "bg-gray-100 rounded-lg" : "hover:bg-gray-100 rounded-lg"}`}
                                onMouseEnter={() => setHoveredConversationKey(conv.key)}
                                onMouseLeave={() => {
                                    setHoveredConversationKey(null);
                                    if (menuOpenKey === conv.key) {
                                        setMenuOpenKey(null); 
                                        setIsEditingKey(null);
                                    }
                                }}
                            >
                                {isEditingKey === conv.key ? (
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onBlur={() => handleEdit(conv.key)}
                                        onKeyDown={(e) => handleKeyDown(e, conv.key)}
                                        className="flex-grow p-1 border rounded-lg"
                                    />
                                ) : (
                                    <span
                                        onClick={() => onConversationClick(conv.key)}
                                        className="flex-grow cursor-pointer truncate"
                                    >
                                        {conv.title.length > 30 ? `${conv.title.substring(0, 30)}...` : conv.title}
                                    </span>
                                )}
                                {hoveredConversationKey === conv.key && (
                                    <div className="ml-2">
                                        <Image
                                            src="/three-dots.svg"
                                            alt="Thao tác"
                                            width={20}
                                            height={20}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuOpenKey(menuOpenKey === conv.key ? null : conv.key);
                                            }}
                                        />
                                        {menuOpenKey === conv.key && (
                                            <div className="absolute bg-white shadow-lg rounded-lg mt-2 z-20">
                                                <button
                                                    onClick={() => {
                                                        setEditTitle(conv.title);
                                                        setIsEditingKey(conv.key);
                                                    }}
                                                    className="flex items-center p-3 hover:bg-gray-100 w-[120px] text-left rounded-lg"
                                                    style={{ justifyContent: "flex-start" }} // Căn trái cho nội dung bên trong
                                                >
                                                    <Image
                                                        src="/edit.svg"
                                                        alt="Rename"
                                                        width={20}
                                                        height={20}
                                                        className="mr-2"
                                                    />
                                                    <span className="flex-grow whitespace-nowrap">Rename</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(conv.key)}
                                                    className="flex items-center p-3 hover:bg-gray-100 w-[120px] text-left rounded-lg"
                                                    style={{ justifyContent: "flex-start" }} // Căn trái cho nội dung bên trong
                                                >
                                                    <Image
                                                        src="/delete.svg"
                                                        alt="Delete"
                                                        width={20}
                                                        height={20}
                                                        className="mr-2"
                                                    />
                                                    <span className="flex-grow whitespace-nowrap">Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;