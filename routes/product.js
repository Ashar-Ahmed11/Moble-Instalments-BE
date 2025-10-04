const express = require('express')
const router = express.Router()
const Product = require('../models/Products')

router.post("/create-products", async (req, res) => {
  try {
    const {
      wholesalerName,
      productName,
      productDescription,
      productType,
      deviceType,
      productImg,
      mobileIMEI1,
      mobileIMEI2,
      wholesalePrice,
    } = req.body;

    // Required fields check
    if (
      !wholesalerName ||
      !productName ||
      !productDescription ||
      !productType ||
      !wholesalePrice
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create product instance
    const product = new Product({
      wholesalerName,
      productName,
      productDescription,
      productType,
      deviceType,
      productImg,
      mobileIMEI1,
      mobileIMEI2,
      wholesalePrice,
    });

    // Save product to DB
    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
      success: true
    });
  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


router.put("/update-product/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true}
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});



router.delete("/deleted-product/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/get-product", async (req, res) => {
  try {
    const products = await Product.find({ sold: false });
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/get-sold-product", async (req, res) => {
  try {
    const products = await Product.find({ sold: true });
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/getproductbyid/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router