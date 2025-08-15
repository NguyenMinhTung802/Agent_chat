import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (agent: { syntax: string; description: string; apiKey: string; isPinned: boolean; }) => void;
    agent: { syntax: string; description: string; apiKey: string; isPinned: boolean; } | null; // Thêm props agent
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, agent }) => {
    const [syntax, setSyntax] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [apiKey, setApiKey] = React.useState('');

    // Khi modal mở, cập nhật giá trị state với thông tin của agent nếu có
    React.useEffect(() => {
        if (agent) {
            setSyntax(agent.syntax);
            setDescription(agent.description);
            setApiKey(agent.apiKey);
        } else {
            setSyntax('');
            setDescription('');
            setApiKey('');
        }
    }, [agent]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({ syntax, description, apiKey, isPinned: false }); // Giả định isPinned mặc định là false khi thêm mới
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center"> {/* Màu nền mờ */}
            <div className="bg-white rounded-lg p-6 w-1/3 shadow-lg"> {/* Thêm shadow cho modal */}
                <h2 className="text-xl mb-4">{agent ? "Edit your agent" : "Add New Agent"}</h2> {/* Thay đổi tiêu đề */}
                <input
                    type="text"
                    placeholder="Syntax"
                    value={syntax}
                    onChange={(e) => setSyntax(e.target.value)}
                    className="border rounded w-full mb-2 p-2"
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border rounded w-full mb-2 p-2"
                />
                <input
                    type="text"
                    placeholder="API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="border rounded w-full mb-4 p-2"
                />
                <div className="flex justify-end">
                    <button onClick={onClose} className="mr-2 text-gray-500">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-500 text-white rounded px-4 py-2">Save</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;