window.ws = new WebSocket('wss://talents-collection.herokuapp.com');

ws.onopen = function () {
    console.log('websocket is connected ...');
    var mes = JSON.stringify({start: true});
    try{ws.send(mes)}catch(err){}
};
ws.onmessage = function (message) {
    var mes = JSON.parse(message.data);
    if(mes.start){
        console.log("start "+mes.start);
        var mes = JSON.stringify({loop: true});
        try{ws.send(mes)}catch(err){}
    }
    if(mes.take){
        console.log(mes.take);
        window.loopMessage = setTimeout(function () {
            var mes = JSON.stringify({loop: true});
            try{ws.send(mes)}catch(err){}
        },30000);
    }
    if(mes.mesLeave){
        console.log(mes.mesLeave)
    }
};
ws.onclose = function (ev) {
    clearTimeout(loopMessage);
    console.log("disconect");
}