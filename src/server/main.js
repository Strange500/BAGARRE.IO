import express from 'express'
const port = 8000;


const app = express();

app.use(express.static('public'));

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})

// serve a js file containing some env using process.env
app.get('/env.js', (req, res) => {
	res.set('Content-Type', 'application/javascript');
	res.send(`const socketUrl = "${process.env.SOCKET_URL || "http://localhost:3000"}"`);
});

console.log(`Socket URL: ${process.env.SOCKET_URL}`);

