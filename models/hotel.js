const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true }, strictPopulate: false };

const HotelSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  opts
);

HotelSchema.virtual("properties.popUpMarkup").get(function () {
  return `
    <strong><a href="/hotels/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 70)}...</p>`;
});

HotelSchema.post("findOneAndDelete", async (hotl) => {
  if (hotl) {
    await Review.deleteMany({ _id: { $in: hotl.reviews } });
  }
});

module.exports = mongoose.model("Hotel", HotelSchema);
