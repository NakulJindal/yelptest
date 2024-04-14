const zod = require("zod");
const sanitizeHtml = require("sanitize-html");

function escapeHTML(value) {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

const validHotelSchema = zod.object({
  hotel: zod.object({
    title: zod.string().transform((value) => escapeHTML(value)),
    price: zod.string().refine((price) => parseFloat(price) >= 0, {
      message: "Price must be greater than or equal to zero",
    }),
    location: zod.string().transform((value) => escapeHTML(value)),
    description: zod.string().transform((value) => escapeHTML(value)),
    reviews: zod.array(),
  }),
  deleteImages: zod.array(zod.string()).optional(),
});

module.exports = validHotelSchema;
