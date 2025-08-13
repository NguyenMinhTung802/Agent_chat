import axios from 'axios';

const apiKey = process.env.NEXT_PUBLIC_API_KEY;

export const sendMessageToAPI = async (message: string, conversationId: string) => {
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
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message to API:', error);
        throw error; // Ném lỗi lên trên
    }
};