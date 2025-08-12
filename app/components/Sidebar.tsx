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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true); // Trạng thái để theo dõi sidebar

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
    <div className={`h-screen max-h-screen sticky top-0 transition-width duration-300 bg-gray-50 flex flex-col text-black ${isSidebarOpen ?  'w-1/6' : 'w-[60px]'}`}>
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
            <span>Cuộc trò chuyện mới</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center justify-center hover:bg-gray-100 rounded-lg m-2 p-2"
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
            className="flex items-center justify-center hover:bg-gray-100 rounded-lg m-2 p-2"
          >
            <Image
              src="/add-note.svg"
              alt="Cuộc trò chuyện mới"
              width={20}
              height={20}
            />
            {/* Bỏ chữ "Cuộc trò chuyện mới", chỉ giữ icon */}
          </button>
        </>
      )}

      {isSidebarOpen && (
        <div className="flex flex-col mt-[30%]">
          <h2 className="p-4 text-left font-bold">Đoạn chat</h2>
          <div className="overflow-y-auto flex-grow">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-2 m-2 cursor-pointer flex justify-between items-center ${
                  currentConversationId === conv.id ? "bg-gray-100 rounded-lg" : "hover:bg-gray-100 rounded-lg"
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
                    className="flex-grow cursor-pointer truncate" // Thêm class để cắt ngắn tên
                  >
                    {conv.title.length > 30 ? `${conv.title.substring(0, 30)}...` : conv.title} {/* Giới hạn chiều dài tên */}
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
                          className="flex items-center p-3 hover:bg-gray-100 w-[120px] text-left rounded-lg"
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
                          className="flex items-center p-3 hover:bg-gray-100 w-[120px] text-left rounded-lg"
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
      )}
    </div>
  );
};

export default Sidebar;