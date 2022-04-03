const mongoose = require("mongoose");

const PhotoSchema = mongoose.Schema({

    x: Number,
    y: Number,
    color: String,
    count: { //How many times its been drawn
        type: Number,
        default: 0,
    },
    held: { //How many users have the pixel
        type: Boolean,
        default: false,
    },
    push: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pushes",
    },
});

module.exports = mongoose.model("pixels", PhotoSchema);
