"use client";
import React, { useState } from "react";
import Image from "next/image";

interface Conversation {
  id: string;
  title: string;
}

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string;
  onNewConversation: () => void;
  onConversationClick: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onEditConversation: (id: string, newTitle: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentConversationId,
  onNewConversation,
  onConversationClick,
  onDeleteConversation,
  onEditConversation,
}) => {
  const [hoveredConversationId, setHoveredConversationId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>(""); 
  const [isEditingId, setIsEditingId] = useState<string | null>(null); 

  const handleEdit = (id: string) => {
    onEditConversation(id, editTitle);
    setEditTitle(""); 
    setIsEditingId(null); 
    setMenuOpenId(null);
  };

  const handleDelete = (id: string) => {
    onDeleteConversation(id);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    id: string
  ) => {
    if (event.key === "Enter") {
      handleEdit(id);
    }
  };

  return (
    <div className="w-1/5 h-full bg-gray-200 flex flex-col text-black p-2">
      <button
        onClick={onNewConversation}
        className="p-4 flex items-center hover:bg-gray-400 rounded-lg"
      >
        <Image
          src="/add-note.svg"
          alt="Thêm cuộc trò chuyện mới"
          width={20}
          height={20}
          className="mr-2"
        />
        Thêm cuộc trò chuyện mới
      </button>
      <div className="flex flex-col mt-[30%]"> {/* Cách top 30% chiều cao */}
        <h2 className="p-4 text-left font-bold">Đoạn chat</h2> {/* Thêm tiêu đề "Đoạn chat" */}
        <div className="overflow-y-auto flex-grow">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-4 cursor-pointer flex justify-between items-center ${
                currentConversationId === conv.id ? "bg-gray-300 rounded-lg" : "hover:bg-gray-400 rounded-lg"
              } rounded-lg`}
              onMouseEnter={() => setHoveredConversationId(conv.id)}
              onMouseLeave={() => {
                setHoveredConversationId(null);
                if (menuOpenId === conv.id) {
                  setMenuOpenId(null); 
                  setIsEditingId(null);
                }
              }}
            >
              {isEditingId === conv.id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleEdit(conv.id)}
                  onKeyDown={(e) => handleKeyDown(e, conv.id)}
                  className="flex-grow p-1 border rounded-lg"
                />
              ) : (
                <span
                  onClick={() => onConversationClick(conv.id)}
                  className="flex-grow cursor-pointer"
                >
                  {conv.title}
                </span>
              )}
              {hoveredConversationId === conv.id && (
                <div className="ml-2">
                  <Image
                    src="/three-dots.svg"
                    alt="Thao tác"
                    width={20}
                    height={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                    }}
                  />
                  {menuOpenId === conv.id && (
                    <div className="absolute bg-white shadow-lg rounded-lg mt-2">
                      <button
                        onClick={() => {
                          setEditTitle(conv.title);
                          setIsEditingId(conv.id);
                        }}
                        className="flex items-center p-2 hover:bg-gray-200 w-full text-left rounded-lg"
                      >
                        <Image
                          src="/edit.svg"
                          alt="Sửa tên"
                          width={20}
                          height={20}
                          className="mr-2"
                        />
                        Sửa tên
                      </button>
                      <button
                        onClick={() => handleDelete(conv.id)}
                        className="flex items-center p-2 hover:bg-gray-200 w-full text-left rounded-lg"
                      >
                        <Image
                          src="/delete.svg"
                          alt="Xóa"
                          width={20}
                          height={20}
                          className="mr-2"
                        />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;