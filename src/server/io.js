import { Server } from 'socket.io'
import http from 'http'

const port = 3000;
const httpServer = http.createServer((req, res) => {
	res.writeHead(403, { 'Content-Type': 'text/plain' });
	res.end('you should not be here');
});


const ioServer = new Server(httpServer, {
	cors: {
		origin: '*',
	}
});

ioServer.on('connection', (socket) => {
	console.log('a user connected');
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
	socket.on('chat message', (msg) => {
		console.log('message: ' + msg);
		ioServer.emit('chat message', msg);
	});
});

httpServer.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})