var http = require('http');
var express = require('express');
var app = express();

// view engine setup
app.set('views', __dirname+'/views');   //view 가 보관되어있는 폴더로 사용
app.set('view engine', 'ejs');          //server edited프로그럼 같이 있는것

// static file setting
app.use(express.static('public'));

//route setup
var index = require('./routes/index');
app.use('/', index);

//port setup
var port = process.env.PORT || 3000;


var server = http.createServer(app);
server.listen(port);


//Azure
var azure = require('azure');
var hubname = "test";
var connectionString = "Endpoint=sb://eifjeifjeifjeifje.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=2Cz6XDeAzkg2iJT1D2XDsu/I7GJ9LXorMhlAtFN6G4w=";
var notificationHubService = azure.createNotificationHubService(hubName,connectionString);

var io = require('socket.io').listen(server);
io.sockets.on('connection',function(socket){
    socket.emit('toclient',{msg:'Welcome!'});
    notificationHubService.gcm.send(null, {data:{id:socket.id, message:'Welcome'}},function(error){
        if(!error){
            console.log('send');
        }
    });

    socket.on('fromclient',function(data){
        socket.broadcast.emit('toclient',data); 
        socket.emit('toclient',data);
        console.log('Message from client :'+data.msg);
       
        if(!data.msg==""){
            notificationHubService.gcm.send(null, {data:{id:socket.id, message:data.msg}}, function(error){
                if(!error){
                    //notification sent
                        console.log('send');
                }
            });
        }
    })
});