const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
      lowercase: true,
    },
    imageUrl: {
      type: String,
      required: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: false,
      lowercase: true,
    },

    reviews: [
      {
        type: new mongoose.Schema(
          {
            comment: {
              type: String,
              required: true,
            },
            rate: {
              type: Number,
              required: true,
            },
          },
          { timestamps: true }
        ),
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
