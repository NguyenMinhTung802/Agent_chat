import axios from 'axios';
// Retrieve API keys from environment variables
const DIRECTOR_AGENT_PUBLIC_API_KEY='app-ykWwcO0oO0lszDlZcvjMJzQv'
const ACCOUNTANT_AGENT_PUBLIC_API_KEY='app-W9WRDuEEqWdvHcLaR9QRWoJA'
const SECRETARY_AGENT_PUBLIC_API_KEY='app-O0S1m6zOpYurQX8LLAdP4Jgh'

// Check if all API keys are set
if (!DIRECTOR_AGENT_PUBLIC_API_KEY || !ACCOUNTANT_AGENT_PUBLIC_API_KEY || !SECRETARY_AGENT_PUBLIC_API_KEY) {
    throw new Error('One or more API keys are missing. Please ensure all API keys are set in the environment variables.');
}
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

interface Agent {
    syntax: string;
    description: string;
    apiKey: string;
    isPinned: boolean; // Thêm thuộc tính isPinned
}

export const getAgentsFromFile = async (): Promise<Agent[]> => {
    if (!baseDirectoryHandle) {
        throw new Error('Base directory is not set. Please set the base directory first.');
    }

    try {
        const fileHandle = await baseDirectoryHandle.getFileHandle('agents.json');
        const file = await fileHandle.getFile();
        const data = await file.text();
        return data ? JSON.parse(data) : []; // Nếu dữ liệu rỗng, trả về mảng rỗng
    } catch (error) {
        if (error instanceof DOMException && error.name === 'NotFoundError') {
            return []; // Nếu file không tồn tại thì trả về mảng rỗng
        } else if (error instanceof SyntaxError) {
            console.error("Invalid JSON format in agents.json:", error.message);
            return []; // Trả về mảng rỗng nếu JSON không hợp lệ
        }
        throw new Error('Error reading agents file: ' + error);
    }
};

export const addAgentToFile = async (newAgent: Agent) => {
    if (!baseDirectoryHandle) {
        throw new Error('Base directory is not set. Please set the base directory first.');
    }
    try {
        const existingAgents = await getAgentsFromFile();
        // Kiểm tra xem syntax đã tồn tại chưa
        const existingAgentIndex = existingAgents.findIndex(agent => agent.syntax === newAgent.syntax);

        if (existingAgentIndex !== -1) {
            // Nếu đã có agent với cùng syntax, cập nhật agent đó
            existingAgents[existingAgentIndex] = newAgent; // Cập nhật agent
        } else {
            // Nếu không có, thêm agent mới vào danh sách
            existingAgents.push(newAgent);
        }

        const fileHandle = await baseDirectoryHandle.getFileHandle('agents.json', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(existingAgents, null, 2));
        await writable.close();
    } catch (error) {
        console.error("Failed to update agents file:", error);
        throw error;
    }
};
export const deleteAgentFromFile = async (agentSyntax: string) => {
    if (!baseDirectoryHandle) {
        throw new Error('Base directory is not set. Please set the base directory first.');
    }

    try {
        const fileHandle = await baseDirectoryHandle.getFileHandle('agents.json');
        const file = await fileHandle.getFile();
        const data = await file.text();
        const agents = JSON.parse(data);

        // Lọc ra các agent không có syntax trùng khớp
        const updatedAgents = agents.filter((agent: Agent) => agent.syntax !== agentSyntax);

        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(updatedAgents, null, 2));
        await writable.close();
    } catch (error) {
        console.error("Failed to delete agent:", error);
        throw error;
    }
};

export const sendMessageToAPI = async (message: string, conversationId: string, agent: string) => {
    // Xác định apiEndpoint dựa trên agent
    let apiEndpoint;
    switch (agent) {
        case 'director':
            apiEndpoint = DIRECTOR_AGENT_PUBLIC_API_KEY;
            break;
        case 'accountant':
            apiEndpoint = ACCOUNTANT_AGENT_PUBLIC_API_KEY;
            break;
        case 'secretary':
            apiEndpoint = SECRETARY_AGENT_PUBLIC_API_KEY;
            break;
        default:
            throw new Error('Invalid agent type');
    }
    console.log("agent được dùng trong api", agent)
    const payload = {
        inputs: {},
        query: message,
        response_mode: 'streaming',
        conversation_id: conversationId,
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
                'Authorization': `Bearer ${apiEndpoint}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message to API:', error);
        throw error;
    }
};

let baseDirectoryHandle: FileSystemDirectoryHandle | null = null;

export const setBaseDirectoryHandle = (directoryHandle: FileSystemDirectoryHandle) => {
    baseDirectoryHandle = directoryHandle;
};
export const updateConversationFile = async (conversationKey: string, messages: Message[]) => {
    if (!baseDirectoryHandle) {
        throw new Error('Base directory is not set. Please set the base directory first.');
    }

    try {
        const fileHandle = await baseDirectoryHandle.getFileHandle(`${conversationKey}.json`);
        const file = await fileHandle.getFile();
        const data = await file.text();
        const conversationData = JSON.parse(data);

        // Cập nhật các tin nhắn mới vào cuộc trò chuyện
        conversationData.messages = messages;

        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(conversationData, null, 2));
        await writable.close();
        console.log("Conversation file updated successfully");
    } catch (error) {
        console.error("Failed to update conversation file:", error);
        throw error;
    }
};
export const fetchMessagesFromFile = async (key: string) => {
    if (!baseDirectoryHandle) {
        throw new Error('Base directory is not set. Please set the base directory first.');
    }
    
    const fileHandle = await baseDirectoryHandle.getFileHandle(`${key}.json`);
    const file = await fileHandle.getFile();
    const data = await file.text();
    return JSON.parse(data);
};

export const createNewConversationFile = async (conversation: Conversation) => {
    if (!baseDirectoryHandle) {
        throw new Error('Base directory is not set. Please set the base directory first.');
    }

    try {
        const fileHandle = await baseDirectoryHandle.getFileHandle(`${conversation.key}.json`, { create: true });
        const writable = await fileHandle.createWritable();
        const content = {
            title: conversation.title,
            latestAgent: conversation.latestAgent,
            conversationId: conversation.conversationId,
            messages: conversation.messages
        };
        await writable.write(JSON.stringify(content, null, 2));
        await writable.close();
        console.log("Conversation file created successfully");
    } catch (error) {
        console.error("Failed to create conversation file:", error);
        throw error;
    }
};