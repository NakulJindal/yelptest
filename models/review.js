const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  comment: String,
  rating: String,
  reviewer: String,
});

module.exports = mongoose.model("Review", ReviewSchema);
