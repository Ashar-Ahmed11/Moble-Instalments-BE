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
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Only fetch instalment transactions that have at least one Pending instalment due today or earlier
    const filter = {
      transactionType: "instalments",
      recycled: false,
      installments: { $elemMatch: { status: "Pending", date: { $lte: todayEnd } } }
    };

    // Minimal projection and lean() for speed
    const candidates = await Transactions.find(
      filter,
      { fullName: 1, contactNumber: 1, installments: 1 }
    ).lean();

    const priceConverter = (amount) => {
      const value = Number(amount);
      if (!Number.isFinite(value)) return "PKR 0";
      return value.toLocaleString("en-US", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    // Prepare SMS jobs (only for installments that are actually due now)
    const smsJobs = [];
    for (const t of candidates) {
      for (const inst of t.installments) {
        if (inst.status === "Pending" && new Date(inst.date) <= todayEnd) {
          smsJobs.push({
            recepient: t.contactNumber,
            transactionID: t._id,
            username: t.fullName,
            dueInstalmentAmount: priceConverter(inst.amount),
          });
        }
      }
    }

    // Fire-and-forget SMS sending in parallel (do not block response)
    if (smsJobs.length) {
      setImmediate(() => {
        Promise.allSettled(
          smsJobs.map((j) =>
            fetch("https://api.textbee.dev/api/v1/gateway/devices/68f3af156a418a16ecaee68b/send-sms", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": "cb78930d-397a-418d-a0c1-a42c989e428c",
              },
              body: JSON.stringify({
                recipients: [j.recepient],
                message:
                  `Hello ${j.username}\nYour Due Instalment Amount is ${j.dueInstalmentAmount}\nPlease visit the following URL to view your receipt:\nhttps://kamran-mobile-zone.web.app/pdf/${j.transactionID}`,
              }),
            })
          )
        ).catch(() => { /* ignore background errors */ });
      });
    }

    // Bulk update: mark all matching Pending installments as Due
    const updateResult = await Transactions.updateMany(
      filter,
      { $set: { "installments.$[el].status": "Due" } },
      { arrayFilters: [{ "el.status": "Pending", "el.date": { $lte: todayEnd } }] }
    );

    const matched = updateResult.matchedCount ?? updateResult.nMatched ?? 0;
    const modified = updateResult.modifiedCount ?? updateResult.nModified ?? 0;

    res.json({ success: true, matched, modified });
  } catch (err) {
    console.error("Error updating installments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});





module.exports = router
