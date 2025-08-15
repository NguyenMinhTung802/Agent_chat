"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { addAgentToFile, getAgentsFromFile } from '../api/api'; 

interface Agent {
    syntax: string;
    description: string;
    apiKey: string;
    isPinned: boolean;
}

const ListAgent: React.FC<{ onSearch: (searchTerm: string) => void; onAddNew: () => void; }> = ({ onSearch, onAddNew }) => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newAgent, setNewAgent] = useState<Agent>({ syntax: '', description: '', apiKey: '', isPinned: false });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAgents = async () => {
        const agentsData = await getAgentsFromFile();
        setAgents(agentsData);
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleAddAgent = async () => {
        await addAgentToFile(newAgent);
        setNewAgent({ syntax: '', description: '', apiKey: '', isPinned: false });
        setShowModal(false); 
        await fetchAgents(); 
    };

    const handleSearch = () => {
        console.log('Searching for agents with term:', searchTerm);
        // Logic tìm kiếm sẽ ở đây (có thể filter agents dựa trên searchTerm)
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const sortedAgents = [...agents].sort((a, b) => {
        return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
    });

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
                        onClick={onAddNew} 
                        className="flex items-center bg-black text-white hover:bg-gray-200 hover:text-white rounded-lg px-4 py-2"
                    >
                        <Image src="/plus.svg" width={20} height={20} alt="Add new" />
                        <span className="ml-2">Add new</span>
                    </button>
                </div>
            </header>
            <div>
                {sortedAgents.length > 0 ? (
                    sortedAgents.map((agent, index) => (
                        <div key={index} className="p-2 border rounded-lg mb-2">
                            <h3 className="font-semibold">{agent.syntax}</h3>
                            <p>{agent.description}</p>
                            <p>API Key: {agent.apiKey}</p>
                            <p>Pinned: {agent.isPinned ? "Yes" : "No"}</p>
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