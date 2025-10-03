const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // User Info
    fullName: {
      type: String,
      required: true,
      
    },
    contactNumber: {
      type: String,
      required: true,
    },
    cnicNumber: {
      type: String,
      
      
    },
    address: {
      type: String,
      required: true,
    },
    image: {
        type: String, 
        // required: true,
    },

    
    granterFullName: {
      type: String,
     
      
    },
    granterContactNumber: {
      type: String,
     
    },
    granterCnicNumber: {
      type: String,
     
    },
    granterAddress: {
      type: String,
     
    },
    granterImage: {
        type: String, 
        // required: true,
    },
    
    
    productType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", 
        required: true,
    },
    
    productDetails:{
        type: String, 
        required: true,
    },
    transactionType:{
        type: String, 
        required: true,
      },
     installments: [
  {
    amount: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    date: { type: Date, required: true }
  }
],
    cashPrice: {
        type: Number,
        
      },
      advanceInstalment: {
      type: Number,

    },
    installmentPrice: {
        type: Number,
        
    },
    recycled: {
      type: Boolean,
      default: false,
    },
   date: { type: Date, default: Date.now }
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Transaction",transactionSchema);
