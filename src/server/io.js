import { Server } from 'socket.io';
import http from 'http';
import { Hub } from './Hub.js';
import fs from 'fs';

const port = 3000;
const hubs = {}; // Object for managing hubs
const users = {}; // Object for managing connected users by socket ID

const SCORES_TO_KEEP = 10;
const bestScoreJsonFile = './public/bestScores.json';
const bestScores = loadBestScores(bestScoreJsonFile);

function loadBestScores(path) {
	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, JSON.stringify([]));
	}
	const data = fs.readFileSync(path);
	return JSON.parse(data);
}

// Create HTTP server and handle requests
const httpServer = http.createServer((req, res) => {
	res.writeHead(403, { 'Content-Type': 'text/plain' });
	res.end('You should not be here');
});

// Initialize Socket.io server with CORS settings
const io = new Server(httpServer, {
	cors: {
		origin: '*', // Change this to your production domain
	},
});

// Start the HTTP server
httpServer.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

// Handle socket connections
io.on('connection', (socket) => {
	console.log('A user connected:', socket.id);

	// Send available rooms to the newly connected user
	socket.emit('room:choices', Object.keys(hubs));

	socket.on("get:bestScores", () => {
		console.log("Sending best scores");
		socket.emit("bestScores", bestScores);
	});

	// Handle the event for joining a room
	socket.on('room:join', (roomName) => {
		if (!roomName) {
			return;
		}
		if (hubs[roomName]) {
			joinExistingRoom(socket, roomName);
		} else {
			createNewRoom(socket, roomName);
		}
		const hub = hubs[roomName];
		hub.handleIoConnection(socket);
	});

	// Handle socket disconnections
	socket.on('disconnect', () => {
		console.log('A user disconnected:', socket.id);
		handleDisconnect(socket);
	});
});

// Function to join an existing room
function joinExistingRoom(socket, roomName) {
	console.log('Joining existing room', roomName);
	socket.join(roomName);
	users[socket.id] = roomName;
}

// Function to create a new room
function createNewRoom(socket, roomName) {
	console.log('Creating new room', roomName);
	hubs[roomName] = new Hub({ maxSizeX: 5000, maxSizeY: 5000 }, io, roomName, 10, 1000, 10);
	socket.join(roomName);
	users[socket.id] = roomName;
}

// Function to handle user disconnections
function handleDisconnect(socket) {
	const roomName = users[socket.id];
	if (roomName) {
		delete users[socket.id];
		if (hubs[roomName]) {
			hubs[roomName].handleDisconnect(socket);
			if (hubs[roomName].players.length === 0) {
				console.log('Closing room:', roomName);
				hubs[roomName].stop();
				delete hubs[roomName];
			}
		}
	}
}

function emptyTempFolder() {
	const dir = './public/img/temp';
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
		return;
	}
	fs.readdir(dir, (err, files) => {
		if (err) {
			console.error('Could not list the directory.', err);
			return;
		}
		files.forEach((file) => {
			fs.unlink(`${dir}/${file}`, (err) => {
				if (err) {
					console.error(`Could not delete file ${file}.`, err);
				}
			});
		});

	});
}
emptyTempFolder();

// create a main hub
hubs['main'] = new Hub({ maxSizeX: 10000, maxSizeY: 10000 }, io, 'main', 30, 5000, 10);
hubs['main'].start();

function updateScores(score) {
	const samepseudo = bestScores.find((bestScore) => bestScore.name === score.name);
	if (samepseudo) {
		if (samepseudo.score < score.score) {
			samepseudo.score = score.score;
			samepseudo.date = score.date;
		}
	} else {
		bestScores.push(score);
	}
	bestScores.sort((a, b) => b.score - a.score);
	if (bestScores.length > SCORES_TO_KEEP) {
		bestScores.length = SCORES_TO_KEEP;
	}
	fs.writeFileSync(bestScoreJsonFile, JSON.stringify(bestScores));
}

setInterval(() => {
	Object.values(hubs).forEach(hub => {
		hub.getScores().forEach(updateScores);
	});
}, 10000);