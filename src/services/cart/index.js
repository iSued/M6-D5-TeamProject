const express = require("express");
const q2m = require("query-to-mongo");
const CartModel = require("../cart/schema");

const CartRouter = express.Router();
CartRouter.get("/:cartId", async (req, res, next) => {
  try {
    console.log("ok");
    const cart = await CartModel.findById(req.params.cartId).populate("cart");
    res.send(cart);
  } catch (error) {
    next(error);
  }
});
CartRouter.post("/:cartId/:productId", async (req, res, next) => {
  try {
    const newProduct = await CartModel.findByIdAndUpdate(req.params.cartId, {
      $push: { cart: req.params.productId },
    });

    res.status(201).send("ok");
  } catch (error) {
    next(error);
  }
});
module.exports = CartRouter;
