const app = require("express")();
const Push = require("../models/Push");
const Pixel = require("../models/Pixel");
const ObjectId = require("mongoose").Types.ObjectId;

app.get("/", async (req, res) => {
    const pushes = await Push.find();
    res.json({ pushes });
})

app.post("/", async (req, res) => {
    console.log(req.body);
    const push = new Push(req.body.push);
    console.log(push);
    let pixels = req.body.pixels;

    push.save().then(async (push) => {
        console.log(push);
        pixels = pixels.map(pixel => {
            pixel.push = push._id;
            return pixel;
        })
        console.log(pixels);
        await Pixel.create(pixels);
        res.json(push);
    })
})

app.get("/:id", async (req, res) => {
    const id = req.params.id;
    if (ObjectId.isValid(id)) {

        const push = await Push.findById(id);
        const pixels = await Pixel.find({ push: id });
        console.log(push);
        res.json({ push, pixels });
    } else
        res.sendStatus(400);
});



module.exports = app;
