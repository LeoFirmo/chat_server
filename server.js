const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const CHAT_LOG_FILE = "chat_log.txt"; 

// INSTALAR 
// npm install -y 
// npm install express socket.io
// RODAR
// node server.js


if (!fs.existsSync(CHAT_LOG_FILE)) {
    console.log("Arquivo de log não encontrado. Criando...");
    fs.writeFileSync(CHAT_LOG_FILE, "", "utf8");
}

app.use(express.static("public"));

app.get("/", (req, res) => {
    console.log("Cliente acessou a página principal.");
    res.sendFile("chat.html");
});

io.on("connection", (socket) => {
    console.log("Novo usuário conectado!"); 

    socket.on("new_message", (message) => {
        console.log("Mensagem recebida do cliente:", message);
    });

    socket.on("disconnect", () => {
        console.log("Usuário desconectado.");
    });
});




io.on("connection", (socket) => {
    console.log("Novo usuário conectado!");

    const chatHistory = fs.readFileSync(CHAT_LOG_FILE, "utf8");
    console.log("Enviando histórico ao cliente:", chatHistory);
    socket.emit("chat_history", chatHistory);

    socket.on("new_message", (message) => {
        console.log("Mensagem recebida:", message);

        const formattedMessage = `${new Date().toLocaleTimeString()} - ${message}`;
        fs.appendFileSync(CHAT_LOG_FILE, formattedMessage + "\n");

        io.emit("new_message", formattedMessage);
    });

    socket.on("disconnect", () => {
        console.log("Usuário desconectado.");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
