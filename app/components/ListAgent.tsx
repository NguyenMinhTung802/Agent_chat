"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { addAgentToFile, getAgentsFromFile } from '../api/api'; // Nhập các hàm cần thiết từ api.ts

interface Agent {
    syntax: string;
    description: string;
    apiKey: string;
    isPinned: boolean; // Thêm thuộc tính isPinned
}

const ListAgent: React.FC<{ onSearch: (searchTerm: string) => void; onAddNew: () => void; }> = ({ onSearch }) => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newAgent, setNewAgent] = useState<Agent>({ syntax: '', description: '', apiKey: '', isPinned: false });

    const fetchAgents = async () => {
        const agentsData = await getAgentsFromFile();
        setAgents(agentsData);
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleAddAgent = async () => {
        await addAgentToFile(newAgent);
        setNewAgent({ syntax: '', description: '', apiKey: '', isPinned: false }); // Reset thông tin agent mới
        setShowModal(false); // Đóng modal
        await fetchAgents(); // Cập nhật danh sách agent
    };
    const sortedAgents = [...agents].sort((a, b) => {
    return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0); // Ghim lên trước
});
    return (
    <div>
        <header className="flex items-center justify-between p-4 m-4">
            <h1 className="text-3xl font-bold">Your AI agent list</h1>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center text-white bg-black hover:bg-gray-100 hover:text-black rounded-lg px-4 py-2"
            >
                <Image src="/plus.svg" width={20} height={20} alt="Add new" />
                <span className="ml-2">Add new</span>
            </button>
        </header>
        <div>
            {sortedAgents.length > 0 ? (
                sortedAgents.map((agent, index) => (
                    <div key={index} className="p-2 border rounded-lg mb-2">
                        <h3 className="font-semibold">{agent.syntax}</h3>
                        <p>{agent.description}</p>
                        <p>API Key: {agent.apiKey}</p>
                        <p>Pinned: {agent.isPinned ? "Yes" : "No"}</p> {/* Hiển thị thông tin isPinned */}
                    </div>
                ))
            ) : (
                <div className="text-center">
                    <p>You do not have any agent.</p>
                </div>
            )}
        </div>
        {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded shadow-lg">
                    <h2 className="text-xl mb-4">Add New Agent</h2>
                    <input
                        type="text"
                        placeholder="Syntax"
                        value={newAgent.syntax}
                        onChange={(e) => setNewAgent({ ...newAgent, syntax: e.target.value })}
                        className="border rounded p-2 mb-2 w-full"
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={newAgent.description}
                        onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                        className="border rounded p-2 mb-2 w-full"
                    />
                    <input
                        type="text"
                        placeholder="API Key"
                        value={newAgent.apiKey}
                        onChange={(e) => setNewAgent({ ...newAgent, apiKey: e.target.value })}
                        className="border rounded p-2 mb-4 w-full"
                    />
                    <button onClick={handleAddAgent} className="bg-blue-500 text-white px-4 py-2 rounded">
                        Add Agent
                    </button>
                    <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded ml-2">
                        Cancel
                    </button>
                </div>
            </div>
        )}
    </div>
);
};

export default ListAgent;