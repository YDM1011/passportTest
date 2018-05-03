const app = require('../../../app');
const wss = app.get('wss');
module.exports.wsInit = function () {
    wss.on('connection', function (ws, req){
        ws.id = 1;
        const ip = req.connection.remoteAddress;
        ws.on('message', function (message) {
            const mes = JSON.parse(message);
            if (mes.start){
                wss.clients.forEach(function each(client) {
                    // if (client !== ws && client.readyState === WebSocket.OPEN){}
                    /*if ((client == ws) && (client.readyState === WebSocket.OPEN)){*/
                        client.time = new Date().getTime()-3000;
                        console.log(client.id +": "+client.time);
                        client.send(JSON.stringify({start: true}));
                    //}
                });
            }
            if (mes.loop){
                // wss.clients.forEach(function each(client) {
                    // if (client !== ws && client.readyState === WebSocket.OPEN){}
                    if ((ws)/* && (client.readyState === WebSocket.OPEN)*/){
                        var client = ws;
                        console.log(client.id +": "+client.time);
                        if (client.time+3000 < new Date().getTime()){
                            client.time = new Date().getTime();
                            client.send(JSON.stringify({take: true}));
                        }else{
                            client.close();
                        }
                    }
                // });
            }
        });
        ws.on('close', function () {
            ws.close();
            wss.clients.forEach(function each(client) {
                if (ws != client){
                    client.send(JSON.stringify({mesLeave: "leave"}));
                }
            });
            console.log("ws was close: " + ws.id);
        });

        // this.wslo();
    });
    // this.wslo = function() {
    //     wss.clients.forEach(function each(client) {
    //         client.send(JSON.stringify({take: true}));
    //     });
    //     setTimeout(this.wslo(), 3000);
    // };

};
