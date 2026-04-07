const Chat = require('./Models/Chat');

module.exports = function(io){

    let users = {};

    io.on('connection', async socket => {
        console.log("Nuevo Usuario conectado");

        let messages = await Chat.find({ msg: { $not: /^\/w / } })
            .sort({ created_at: -1 })
            .limit(8)
            .lean();

        messages.reverse();

        socket.emit('Cargando viejos mensajes', messages);

        socket.on('Nuevo usuario', (data, cb) => {
            if(data in users){
                cb(false);
            }else{
                cb(true);
                socket.nickname = data;
                users[socket.nickname] = socket;
                updateNicknames();
            }
        });

        socket.on("Enviar mensaje", async (data, cb) => {
            var msg = data.trim();

            if(msg.startsWith('/w ')){
                msg = msg.substr(3);
                const index = msg.indexOf(' ');

                if(index != -1){
                    var name = msg.substring(0, index);
                    var privatemsg = msg.substring(index + 1);

                    if(name in users){
                        users[name].emit('whisper',{
                            msg: privatemsg,
                            nick: socket.nickname
                        });

                        socket.emit('whisper',{
                            msg: privatemsg,
                            nick: socket.nickname
                        });

                    }else{
                        cb('Error! Por favor entra un usuario validado');
                    }

                }else{
                    cb('Error! Por favor ingresa tu mensaje');
                }

            }else{

                var newMsg = new Chat({
                    nick: socket.nickname,
                    msg: msg
                });

                await newMsg.save();

                const total = await Chat.countDocuments();

                if(total > 8){
                    const oldMessages = await Chat.find()
                        .sort({ created_at: 1 })
                        .limit(total - 8);

                    for(let msg of oldMessages){
                        await Chat.deleteOne({ _id: msg._id });
                    }
                }

                io.sockets.emit('Nuevo mensaje', {
                    msg: newMsg.msg,
                    nick: newMsg.nick
                });
            }
        });

        socket.on('disconnect', () => {
            if(!socket.nickname) return;
            delete users[socket.nickname];
            updateNicknames();
        });

        function updateNicknames(){
            io.sockets.emit('usernames', Object.keys(users));
        }

    });
};