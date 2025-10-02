const express = require('express')
const router = express.Router()
const Transactions = require('../models/Transactions')



// CREATE 
router.post("/create-transaction", async (req, res) => {
  try {
    const transaction = new Transactions(req.body);
    await transaction.save();
    //  res.json({ success: true, transaction });
    return res.status(201).json({ success: true, transaction });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
})


// READ all 
router.get("/get-transactions", async (req, res) => {
  try {
    const transactions = await Transactions.find({ recycled: false }).populate("productType");
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});




// UPDATE 

router.put("/update-transactions/:id", async (req, res) => {
  try {
    const updatedTransaction = await Transactions.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },   // only update the provided fields
      { new: true } // return updated doc & run schema validators
    );

    if (!updatedTransaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.json({ success: true, transaction: updatedTransaction });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});


// DELETE User
router.delete("/delete-transactions/:id", async (req, res) => {
  try {
    const deletedTransactions = await Transactions.findByIdAndDelete(req.params.id);
    if (!deletedTransactions) {
      return res.status(404).json({ success: false, message: "Transactions not found" });
    }
    res.json({ success: true, message: "Transactions deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// 📌 Get a single transaction by ID
router.get("/get-transaction/:id", async (req, res) => {
  try {
    const transaction = await Transactions.findById(req.params.id).populate("productType");

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.get("/get-recycled-transactions", async (req, res) => {
  try {
    // ✅ Only fetch transactions where recycle = true
    const transactions = await Transactions.find({ recycled: true }).populate("productType");
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Fetch only CASH transactions
router.get("/get-cash-transactions", async (req, res) => {
  try {
    const transactions = await Transactions.find({ transactionType: "cash" })
      .populate("productType");
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Fetch only INSTALMENT transactions
router.get("/get-instalment-transactions", async (req, res) => {
  try {
    const transactions = await Transactions.find({ transactionType: "instalments" })
      .populate("productType");
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/get-pending-instalment-transactions", async (req, res) => {
  try {
    const transactions = await Transactions.find({
      transactionType: "instalments",
      "installments.status": "Pending"  // check if any instalment is pending
    }).populate("productType");

    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/get-fully-paid-instalment-transactions", async (req, res) => {
  try {
    const transactions = await Transactions.find({
      transactionType: "instalments",
      installments: {
        $not: { $elemMatch: { status: { $ne: "Paid" } } }
      }
    }).populate("productType");

    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/get-due-instalment-transactions", async (req, res) => {
  try {
    const transactions = await Transactions.find({
      transactionType: "instalments",
      "installments.status": "Due"  // check if any instalment is pending
    }).populate("productType");

    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



module.exports = router
