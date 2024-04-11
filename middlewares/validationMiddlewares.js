const validCampgroundSchema = require("../validationSchemas/validCampground");
const ExpressError = require("../utils/ExpressError");
const zod = require("zod");

async function campgroundValidate(req, res, next) {
  const { success, error } = validCampgroundSchema.safeParse(req.body);
  if (success) next();
  else {
    const message = error.errors.map((err) => err.message).join(", ");
    next(new ExpressError(message, 400));
  }
}

module.exports = { campgroundValidate };
