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
  onEditConversation: (id: string, newTitle: string) => void; // Thêm prop này
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentConversationId,
  onNewConversation,
  onConversationClick,
  onDeleteConversation,
  onEditConversation,
}) => {
  const [hoveredConversationId, setHoveredConversationId] =
    useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>(""); // Trạng thái cho ô nhập tên
  const [isEditingId, setIsEditingId] = useState<string | null>(null); // Trạng thái đồng bộ với cuộc hội thoại đang được chỉnh sửa

  const handleEdit = (id: string) => {
    onEditConversation(id, editTitle); // Gọi hàm edit với tên mới
    setEditTitle(""); // Reset ô nhập sau khi chỉnh sửa xong
    setIsEditingId(null); // Đóng chế độ chỉnh sửa

    // Đóng menu
    setMenuOpenId(null);
  };

  const handleDelete = (id: string) => {
    onDeleteConversation(id); // Gọi hàm xóa cuộc hội thoại
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    id: string
  ) => {
    if (event.key === "Enter") {
      handleEdit(id); // Gọi hàm handleEdit khi bấm Enter
    }
  };

  return (
    <div className="w-1/5 h-full bg-gray-300 flex flex-col text-black pt-10 pb-10">
      <button
        onClick={onNewConversation}
        className="p-4 flex items-center hover:bg-white rounded"
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
      <div className="overflow-y-auto flex-grow">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`p-4 cursor-pointer flex justify-between items-center ${
              currentConversationId === conv.id ? "bg-gray-200" : "hover:bg-white"
            } rounded`}
            onMouseEnter={() => setHoveredConversationId(conv.id)} // Hover vào để thiết lập
            onMouseLeave={() => {
              setHoveredConversationId(null); // Rời ra để đóng
              if (menuOpenId === conv.id) {
                setMenuOpenId(null); // Đóng menu nếu nó đang mở
                setIsEditingId(null); // Đóng chế độ chỉnh sửa nếu cần
              }
            }}
          >
            {isEditingId === conv.id ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => handleEdit(conv.id)} // Gọi hàm handleEdit khi ô nhập mất tiêu điểm
                onKeyDown={(e) => handleKeyDown(e, conv.id)} // Gọi hàm khi nhấn phím
                className="flex-grow p-1 border rounded"
              />
            ) : (
              <span
                onClick={() => onConversationClick(conv.id)}
                className="flex-grow cursor-pointer"
              >
                {conv.title}
              </span>
            )}
            <div className="ml-2">
              <Image
                src="/three-dots.svg"
                alt="Thao tác"
                width={20}
                height={20}
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn không cho sự kiện click tác động lên cuộc hội thoại
                  setMenuOpenId(menuOpenId === conv.id ? null : conv.id); // Chuyển đổi trạng thái mở menu
                }}
              />
              {menuOpenId === conv.id && (
                <div className="absolute bg-white shadow-lg rounded mt-2">
                  <button
                    onClick={() => {
                      setEditTitle(conv.title); // Set giá trị ô nhập bằng tiêu đề hiện tại
                      setIsEditingId(conv.id); // Bắt đầu chế độ chỉnh sửa
                    }}
                    className="flex items-center p-2 hover:bg-gray-200 w-full text-left"
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
                    onClick={() => handleDelete(conv.id)} // Gọi hàm xóa khi nhấn nút
                    className="flex items-center p-2 hover:bg-gray-200 w-full text-left"
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;