const zod = require("zod");
const sanitizeHtml = require("sanitize-html");

function escapeHTML(value) {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

const validReviewSchema = zod.object({
  reviews: zod.object({
    comment: zod.string().transform((value) => escapeHTML(value)),
    rating: zod.string().refine((rating) => rating >= 0, {
      message: "rating must be greater than or equal to zero",
    }),
  }),
});

module.exports = validReviewSchema;
