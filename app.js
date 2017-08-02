import http from 'http';
import express from 'express';

let app = express();

app.get('/',(req,res,next) => {
    console.log('test');
    res.send('ok');
})

let server = http.createServer(app, () => console.log('server started.....'));
server.listen(80);