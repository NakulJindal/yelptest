const zod = require("zod");

const validReviewSchema = zod.object({
  reviews: zod.object({
    comment: zod.string(),
    rating: zod.string().refine((rating) => rating >= 0, {
      message: "rating must be greater than or equal to zero",
    }),
  }),
});

module.exports = validReviewSchema;
