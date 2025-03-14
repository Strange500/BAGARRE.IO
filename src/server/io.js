import { Server } from 'socket.io'
import http from 'http'
import {Hub} from "./Hub.js";

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

new Hub({ maxSizeX: 5000, maxSizeY: 5000 }, ioServer);

httpServer.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})