export default function chatController(chatNamespace) {
    chatNamespace.on('connection', (socket) => {
        console.log('User connected to chat');
    });
}