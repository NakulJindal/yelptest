const express = require("express");
const multer = require("multer");
const { storage } = require("../cloudinary");
const hotel = require("../controllers/hotels");
const catchAsync = require("../utils/catchAsync");
const { hotelValidate } = require("../middlewares/validationMiddlewares");
const {
  authenticateLogin,
  isAuthor,
  storeReturnTo,
} = require("../middlewares/authenticationMiddleware");

const router = express.Router();
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(hotel.getAllHotels))
  .post(
    authenticateLogin,
    upload.array("image"),
    hotelValidate,
    catchAsync(hotel.addNewHotel)
  );

router.get("/new", authenticateLogin, hotel.renderNewHotelForm);

router
  .route("/:id")
  .get(catchAsync(hotel.getHotel))
  .put(
    authenticateLogin,
    isAuthor,
    upload.array("image"),
    hotelValidate,
    catchAsync(hotel.updateHotel)
  )
  .delete(authenticateLogin, isAuthor, catchAsync(hotel.deleteHotel));

router.get(
  "/:id/edit",
  authenticateLogin,
  isAuthor,
  catchAsync(hotel.renderEditHotelForm)
);

module.exports = router;
