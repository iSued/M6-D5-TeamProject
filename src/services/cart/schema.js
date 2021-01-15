const { Schema, model } = require("mongoose");

const CartSchema = new Schema(
  {
    cart: {
      type: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    },
  },
  {
    timestamps: true,
  }
);

const CartModel = model("Cart", CartSchema);
module.exports = CartModel;
