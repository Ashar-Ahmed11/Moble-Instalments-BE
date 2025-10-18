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

    const checkInstalmentDue = async () => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      // const response = await fetch("https://mobileinstalmentex-dot-arched-gear-433017-u9.de.r.appspot.com/api/transaction/checkInstalmentDue", {

      const response = await fetch("https://mobileinstalmentex-dot-arched-gear-433017-u9.de.r.appspot.com/api/transaction/checkInstalmentDue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      

      });

      const result = await response.json()
      console.log(result);

    }
    checkInstalmentDue()
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
    const transactions = await Transactions.find({ transactionType: "cash", recycled: false })
      .populate("productType");
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Fetch only INSTALMENT transactions
router.get("/get-instalment-transactions", async (req, res) => {
  try {
    const transactions = await Transactions.find({ transactionType: "instalments", recycled: false })
      .populate("productType");
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/get-pending-due-instalment-transactions", async (req, res) => {
  try {
    const transactions = await Transactions.find({
      transactionType: "instalments",
      "installments.status": { $in: ["Pending", "Due"] },
      recycled: false,
    }).populate("productType");

    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/get-pending-instalment-transactions", async (req, res) => {
  try {
    const transactions = await Transactions.find({
      transactionType: "instalments",
      "installments.status": "Pending"  // check if any instalment is pending,
      , recycled: false
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
      }, recycled: false

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
      , recycled: false
    }).populate("productType");

    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/checkInstalmentDue", async (req, res) => {
  try {
    const transactions = await Transactions.find({
      transactionType: "instalments",
      "installments.status": { $in: ["Pending", "Due"] },
      recycled: false,
    }).populate("productType");

    const currentDate = new Date();

    // Helper function to format date as dd mm yy
    const formatDate = (date) => {
      const d = new Date(date);
      const day = d.getDate();
      const month = d.getMonth() + 1; // months are 0-indexed
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };


    const formattedCurrentDate = formatDate(currentDate);
    const priceConverter = (_amount) => {
      let convertedAmount = _amount.toLocaleString("en-US", {
        style: "currency", currency: "PKR", minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
      return convertedAmount
    }
    const sendSMS = async (recepient, transactionID, username, dueInstalmentAmount) => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const response = await fetch("https://api.textbee.dev/api/v1/gateway/devices/68f3af156a418a16ecaee68b/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "cb78930d-397a-418d-a0c1-a42c989e428c"
        },
        body: JSON.stringify({
          recipients: [recepient],
          message:
            `Hello ${username}\nYour Due Instalment Amount is ${dueInstalmentAmount}\nPlease visit the following URL to view your receipt:\nhttps://kamran-mobile-zone.web.app/pdf/${transactionID}`
        }),

      });

    }

    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      const { installments } = transaction;

      for (let j = 0; j < installments.length; j++) {
        const inst = installments[j];
        const instDate = new Date(inst.date);

        const formattedDueDate = formatDate(instDate);

        // Compare dates (only day, month, year)
        if (formattedCurrentDate === formattedDueDate && inst.status === "Pending") {
          inst.status = "Due";
          sendSMS(transaction.contactNumber, transaction._id, transaction.fullName, priceConverter(inst.amount))
        }
      }

      // Save the transaction after updating installment statuses
      await transaction.save()
    }

    res.json({ success: true, message: "Due installments updated successfully." });
  } catch (err) {
    console.error("Error updating installments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});





module.exports = router
