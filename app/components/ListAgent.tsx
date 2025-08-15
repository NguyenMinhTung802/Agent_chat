"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { addAgentToFile, getAgentsFromFile } from '../api/api'; 
import Modal from './Modal'; // Nhập component Modal

interface Agent {
    syntax: string;
    description: string;
    apiKey: string;
    isPinned: boolean;
}

const ListAgent: React.FC = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false); // State để mở/đóng modal
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null); // Agent hiện tại
    const [searchTerm, setSearchTerm] = useState('');
    const [originalAgents, setOriginalAgents] = useState<Agent[]>([]);

    const fetchAgents = async () => {
        const agentsData = await getAgentsFromFile();
        setAgents(agentsData);
        setOriginalAgents(agentsData); // Cập nhật danh sách gốc
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handlePinAgent = async (agent: Agent) => {
        const updatedAgent = { ...agent, isPinned: !agent.isPinned };
        await addAgentToFile(updatedAgent); // Cập nhật agent trong file
        fetchAgents(); // Lấy lại danh sách agents
    };

    const handleAddNewAgent = async (agent: { syntax: string; description: string; apiKey: string; isPinned: boolean; }) => {
        await addAgentToFile(agent); // Thêm agent mới
        fetchAgents(); // Lấy lại danh sách agents
    };

    const handleUpdateAgent = async (updatedAgent: Agent) => {
        await addAgentToFile(updatedAgent); // Cập nhật thông tin agent
        fetchAgents(); // Lấy lại danh sách agents
    };

    const handleSearch = () => {
        const filteredAgents = originalAgents.filter(agent => 
            agent.syntax.toLowerCase().includes(searchTerm.toLowerCase()) || 
            agent.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setAgents(filteredAgents); // Cập nhật danh sách agents theo kết quả tìm kiếm
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleEditAgent = (agent: Agent) => {
        setSelectedAgent(agent);
        setShowModal(true);
    };

    const sortedAgents = [...agents].sort((a, b) => {
        return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
    });

    const pinnedAgents = sortedAgents.filter(agent => agent.isPinned);
    const unpinnedAgents = sortedAgents.filter(agent => !agent.isPinned);

    return (
        <div>
            <header className="flex items-center justify-between p-4">
                <h1 className="text-3xl font-bold">Your AI agent list</h1>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleSearch} 
                        className="flex items-center bg-gray-50 text-black hover:bg-gray-100 hover:text-black rounded-lg px-4 py-2"
                    >
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Your Agent"
                            onKeyDown={handleKeyDown} 
                            className="border-0 focus:outline-none focus:ring-0"
                        />
                        <Image src="/search.svg" width={20} height={20} alt="Search your agent" className="ml-2" />
                    </button>
                    <button 
                        onClick={() => {
                            setSelectedAgent(null); // Reset selected agent khi thêm mới
                            setShowModal(true); // Mở modal để thêm agent mới
                        }} 
                        className="flex items-center bg-black text-white hover:bg-gray-200 hover:text-white rounded-lg px-4 py-2"
                    >
                        <Image src="/plus.svg" width={20} height={20} alt="Add new" />
                        <span className="ml-2">Add new</span>
                    </button>
                </div>
            </header>

            {/* Modal để thêm hoặc chỉnh sửa agent */}
            <Modal 
                isOpen={showModal} 
                onClose={() => {
                    setShowModal(false);
                    setSelectedAgent(null);  // Reset selected agent khi đóng modal
                }} 
                onSave={selectedAgent ? handleUpdateAgent : handleAddNewAgent} 
                agent={selectedAgent}  // Chuyển agent đang được chỉnh sửa vào modal
            />

            <div className="grid grid-cols-4 gap-4 p-4">
                {pinnedAgents.length > 0 && (
                    <div className="col-span-4 mb-4">
                        <h2 className="text-xl font-semibold">Pinned Agents</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {pinnedAgents.map((agent, index) => (
                                <div key={index} className="border rounded-lg p-4 flex">
                                    <div className="flex-shrink-0">
                                        <Image src="/bot_avatar.png" alt="Agent" width={50} height={50} />
                                    </div>
                                    <div className="ml-4 flex-grow">
                                        <h3 className="font-semibold">{agent.syntax}</h3>
                                        <p className="line-clamp-2">{agent.description}</p>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={() => handlePinAgent(agent)} className="flex items-center bg-yellow-500 text-white rounded px-2">
                                                <Image src="/pin.svg" alt="Pin/Unpin" width={20} height={20} />
                                                <span>{agent.isPinned ? 'Unpin' : 'Pin'}</span>
                                            </button>
                                            <button onClick={() => handleEditAgent(agent)} className="flex items-center bg-blue-500 text-white rounded px-2">
                                                <Image src="/edit.svg" alt="Edit" width={20} height={20} />
                                                <span>Edit</span>
                                            </button>
                                            <button className="flex items-center bg-red-500 text-white rounded px-2">
                                                <Image src="/delete.svg" alt="Delete" width={20} height={20} />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="col-span-4 mb-4">
                    <h2 className="text-xl font-semibold">Unpinned Agents</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {unpinnedAgents.length > 0 ? (
                            unpinnedAgents.map((agent, index) => (
                                <div key={index} className="border rounded-lg p-4 flex">
                                    <div className="flex-shrink-0">
                                        <Image src="/bot_avatar.png" alt="Agent" width={50} height={50} />
                                    </div>
                                    <div className="ml-4 flex-grow">
                                        <h3 className="font-semibold">{agent.syntax}</h3>
                                        <p className="line-clamp-2">{agent.description}</p>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={() => handlePinAgent(agent)} className="flex items-center bg-yellow-500 text-white rounded px-2">
                                                <Image src="/pin.svg" alt="Pin" width={20} height={20} />
                                                <span>Pin</span>
                                            </button>
                                            <button onClick={() => handleEditAgent(agent)} className="flex items-center bg-blue-500 text-white rounded px-2">
                                                <Image src="/edit.svg" alt="Edit" width={20} height={20} />
                                                <span>Edit</span>
                                            </button>
                                            <button className="flex items-center bg-red-500 text-white rounded px-2">
                                                <Image src="/delete.svg" alt="Delete" width={20} height={20} />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center col-span-4">
                                <p>You do not have any unpinned agents.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListAgent;