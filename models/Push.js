const mongoose = require("mongoose");

const PhotoSchema = mongoose.Schema({
    img: String,
    time: Date
});

module.exports = mongoose.model("pushes", PhotoSchema);
