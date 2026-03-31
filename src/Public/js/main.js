$(function(){

    const socket = io();

    const $messageForm = $('#message-form');
    const $messageBox = $('#message');
    const $chat = $('#chat');

    $messageForm.submit(e =>{
        e.preventDefault();
        //conexion de soket para enviar los datos
        socket.emit('Enviar mensaje',$messageBox.val(),data =>{
            $chat.append(`<p class= "error">${data}</p>`)
        });
        $messageBox.val('');
    });

    socket.on('Nuevo mensaje', function(data){
        console.log('Nuevo mensaje recibido:', data);
        $chat.append('<b>'+ data.nick + '</b>: '+ data.msg + '<br/>');
    });

    socket.on('whisper', function(data){
        if (!data || !data.msg || !data.nick) return;
        $chat.append(`<p class="whisper"><b>${data.nick} (privado):</b> ${data.msg}</p>`);
    });

    socket.on('usernames',data =>{
        let html = '';
        for (let i = 0; i < data.length; i++){
            html += `<p><i class="fas fa-user color-primary"></i> ${data[i]}</p>`;
        }
        $users.html(html);
    })


    socket.on('Cargando viejos mensajes', msgs => {
        console.log('Mensajes antiguos recibidos:', msgs); 
        msgs.forEach(msg => displayMsg(msg));
    });

    function displayMsg(data){
        if (!data || !data.msg || !data.nick) return; 
        $chat.append(`<p class= "whisper"><b>${data.nick}:</b> ${data.msg}</p>`);
    };

    const $nickForm = $('#nickForm');
    const $nickError = $('#nickError');
    const $nickname = $('#nickname');

    const $users = $('#usernames');

    let myNick = '';

    $nickForm.submit(e =>{
        e.preventDefault();
        const nick = $nickname.val().trim();
        if (!nick) {
            $nickError.html('<div class="alert alert-danger">No se pueden ingresar usuarios vacíos</div>');
            return;
        }
        myNick = nick;
        socket.emit('Nuevo usuario', nick, data =>{
            if (data){
                $('#nickWrap').hide();
                $('#contentWrap').show();
            } else {
                $nickError.html('<div class="alert alert-danger">Ese usuario ya existe!</div>')
            }
            $nickname.val('');
        });
    })


    

});
