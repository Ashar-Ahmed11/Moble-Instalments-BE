const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    wholesalerName: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,  
    },
    productDescription: {
      type: String,
      required: true,
    },
    productType: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      required: true,
    },
    productImg: {
      type: String,
    },
    mobileIMEI1: {
      type: String,
      // required: true,
    },
    mobileIMEI2: {
      type: String,
      // required: true,
    },
    wholesalePrice: {
      type: Number,
      required: true,
    },
     sold : {
      type: Boolean,
      default: false,
    },
    date: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
