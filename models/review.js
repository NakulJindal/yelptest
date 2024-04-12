const mongoose = require("mongoose");
const User = require("./user");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  comment: String,
  rating: String,
  reviewer: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Review", ReviewSchema);
