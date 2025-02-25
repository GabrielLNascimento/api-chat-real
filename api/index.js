const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configuração do CORS
app.use(
    cors({
        origin: 'https://chat-real-time-delta.vercel.app', // URL do frontend
        methods: ['GET', 'POST'],
    })
);

// Configuração do Socket.IO
const io = new Server(server, {
    cors: {
        origin: 'https://chat-real-time-delta.vercel.app', // URL do frontend
        methods: ['GET', 'POST'],
    },
});

let users = {}; // Objeto para armazenar os usuários conectados e seus nomes

io.on('connection', (socket) => {
    console.log('Usuário conectado: ', socket.id);

    // Quando um usuário envia seu nome, ele é armazenado
    socket.on('setName', (name) => {
        users[socket.id] = name;
        console.log(`Usuário ${name} conectado.`);
    });

    // Quando o usuário envia uma mensagem, ela é transmitida para todos
    socket.on('chatMessage', (data) => {
        const senderName = users[socket.id]; // Pega o nome do usuário
        const message = { ...data, name: senderName }; // Adiciona o nome ao objeto de mensagem
        io.emit('chatMessage', message); // Envia a mensagem para todos os clientes
    });

    // Quando o usuário desconecta
    socket.on('disconnect', () => {
        const userName = users[socket.id]; // Pega o nome do usuário desconectado
        console.log(`Usuário ${userName} desconectado`);
        delete users[socket.id]; // Remove o usuário da lista
    });
});

// Inicia o servidor na porta 3001
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Exporta o app para o Vercel
module.exports = app;
