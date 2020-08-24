const express = require("express");
const bodyParser = require("body-parser");
const gameSession = require("./game-session.js");
const port = 4049;
const clientPath = `../client/dist/client`;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
// Point to built angular files
app.get("/", async (req, res) => {
	res.sendFile("index.html", {root: clientPath});
});

// Make sure client files get served up
app.get("/:filename", async (req, res) => {
  var filename = req.params.filename;
  res.sendFile(filename, {root: clientPath});
});

const server = app.listen(port, () => {
	console.log(`Node server is up on port ${port}`);
});

gameSession.setupSocketIo(server);