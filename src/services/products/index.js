const express = require("express");
const mongoose = require("mongoose");
const ProductsSchema = require("./schema");
const ProductsRouter = express.Router();
const q2m = require("query-to-mongo");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../../cloudinary");

// Only products
ProductsRouter.get("/", async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const total = await ProductsSchema.countDocuments(query.criteria);
    const products = await ProductsSchema.find(query.criteria)
      .sort(query.options.sort)
      .skip(query.options.skip)
      .limit(query.options.limit);

    res.send({ links: query.links("/products", total), products });
  } catch (error) {
    next(error);
  }
});

ProductsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await ProductsSchema.findById(id);
    if (product) {
      res.send(product);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("Product not found!");
  }
});

ProductsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductsSchema(req.body);
    const { _id } = await newProduct.save();

    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

ProductsRouter.put("/:id", async (req, res, next) => {
  try {
    const product = await ProductsSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    if (product) {
      res.send(product);
    } else {
      const error = new Error(`Product with id:${req.params.id} not found`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

ProductsRouter.delete("/:id", async (req, res, next) => {
  try {
    const product = await ProductsSchema.findByIdAndDelete(req.params.id);
    if (product) {
      res.send("Deleted");
    } else {
      const error = new Error(`Product with id:${req.params.id} not found`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

//Reviews Sub-Routers

ProductsRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await ProductsSchema.findById(id);
    if (product) {
      res.send(product.reviews);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("Product not found!");
  }
});
ProductsRouter.get("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const { reviews } = await ProductsSchema.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      }
    );

    if (reviews && reviews.length > 0) {
      res.send(reviews[0]);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

ProductsRouter.post("/:id/reviews", async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await ProductsSchema.findById(id);
    if (product) {
      const product = await ProductsSchema.findByIdAndUpdate(
        id,
        {
          $push: { reviews: req.body },
        },
        { new: true }
      );
      res.send(product);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next("Product not found!");
  }
});

ProductsRouter.delete("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const id = req.params.id;
    const reviewId = req.params.reviewId;
    const product = await ProductsSchema.findById(id);
    if (product) {
      const product = await ProductsSchema.findByIdAndUpdate(
        id,
        { $pull: { reviews: { _id: mongoose.Types.ObjectId(reviewId) } } },
        {
          new: true,
        }
      );
      res.send(product);
    } else {
      const error = new Error(`Product with this ${id} does not exist`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

ProductsRouter.put("/:id/reviews/:reviewId", async (req, res, next) => {
  let newRate = req.body.rate;
  let newComment = req.body.comment;
  try {
    let result = await ProductsSchema.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "reviews.$[inner].rate": newRate,
          "reviews.$[inner].comment": newComment,
        },
      },
      {
        arrayFilters: [{ "inner._id": req.params.reviewId }],
        new: true,
      }
    );

    if (!result) return res.status(404);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
});

//upload image route

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "striveTest",
  },
});

const cloudinaryMulter = multer({ storage: storage });

ProductsRouter.post(
  "/image",
  cloudinaryMulter.single("image"),
  async (req, res, next) => {
    try {
      const path = req.file;
      res.status(201).send({ path });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = ProductsRouter;
