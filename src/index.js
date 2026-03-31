const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const mongoose = require('mongoose');

const app = express();

app.set('port', process.env.PORT || 3000);

const server = http.createServer(app);
const io = socketio(server);

io.on('connection', socket => {
    console.log("Nuevo Usuario conectado");
});

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chat-database';

mongoose.connect(dbURI)
    .then(() => console.log('Base de datos conectada'))
    .catch(err => console.log('Error en DB:', err));

require('./sockets')(io);

app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.static("Cliente"));

server.listen(app.get('port'), '0.0.0.0', () => {
    console.log("Servidor en el puerto", app.get('port'));
});