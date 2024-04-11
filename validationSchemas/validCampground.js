const zod = require("zod");

const validCampgroundSchema = zod.object({
  campground: zod.object({
    title: zod.string(),
    price: zod.string().refine((price) => price >= 0, {
      message: "Price must be greater than or equal to zero",
    }),
    image: zod.string().url(),
    location: zod.string(),
    description: zod.string(),
  }),
});

module.exports = validCampgroundSchema;
