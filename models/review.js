const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  comment: String,
  rating: String,
});

module.exports = mongoose.model("Review", ReviewSchema);
