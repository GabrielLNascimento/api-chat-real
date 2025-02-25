const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');  // Importa o cors

const app = express();
const server = http.createServer(app);

// Configurando o CORS para permitir requisições do domínio do frontend
app.use(cors({
  origin: 'http://localhost:5173', // URL do frontend
  methods: ['GET', 'POST']
}));

// Se você estiver servindo arquivos estáticos, pode manter também:
app.use(express.static('public'));

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173', // URL do frontend
    methods: ['GET', 'POST']
  }
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

server.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});
