const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const bodyParser = require('body-parser')
require('dotenv').config()
require("./config/mongoose-setup");
const Push = require("./models/Push");
const Pixel = require("./models/Pixel");


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html');
});

app.get('/push', (req, res) => {
    res.sendFile(__dirname + '/pages/push.html');
});

app.get("/push/:id", (req, res) => {
    res.sendFile(__dirname + '/pages/_push.html');
})

app.use("/api", require("./api"));

const heldpixel = {};

async function update(id) {
    const heldpixels = await Pixel.countDocuments({ push: id, held: true });
    const pixels = await Pixel.countDocuments({ push: id });

    io.sockets.emit(id, {
        heldpixels,
        pixels
    });
}

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    socket.on("assign", async (data) => {
        console.log("ASSIGN", data, socket.id);
        if (heldpixel[socket.id]) {
            let pixel = await Pixel.findById(heldpixel[socket.id]);
            pixel.count--;
            pixel.held = false;
            await pixel.save();
            console.log("DEASSIGNED")
            heldpixel[socket.id] = null;
        }

        console.log(await Pixel.find({
            push: data.id,

        }).sort([['count']]));

        const pixel = await Pixel.findOne({
            push: data.id,
        }).sort([['count']]);
        console.log("ASSIGNED");
        heldpixel[socket.id] = pixel._id;
        socket.emit("assigned", pixel);
        console.log(heldpixel);
        pixel.count++;
        pixel.held = true;
        await pixel.save();
        update(pixel.push._id);
    });

    socket.on("done", async (data) => {
        if (heldpixel[socket.id]) {
            console.log("DONE");
            let pixel = await Pixel.findById(heldpixel[socket.id]);
            pixel.held = false;
            await pixel.save();
            heldpixel[socket.id] = null;
            update(pixel.push._id);
        }
    });

    socket.on('disconnect', async () => {
        console.log('user disconnected', socket.id);
        if (heldpixel[socket.id]) {
            let pixel = await Pixel.findById(heldpixel[socket.id]);
            pixel.count--;
            pixel.held = false;
            await pixel.save();
            heldpixel[socket.id] = null;
            console.log(heldpixel);
            update(pixel.push._id);
        }
    });
});



server.listen(3000, () => {
    console.log('listening on *:3000');
});