const zod = require("zod");

const validCampgroundSchema = zod.object({
  campground: zod.object({
    title: zod.string(),
    price: zod.string().refine((price) => parseFloat(price) >= 0, {
      message: "Price must be greater than or equal to zero",
    }),
    location: zod.string(),
    description: zod.string(),
    reviews: zod.array(),
  }),
  deleteImages: zod.array(zod.string()).optional(),
});

module.exports = validCampgroundSchema;
