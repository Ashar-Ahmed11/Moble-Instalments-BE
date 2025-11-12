const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // User Info
    fullName: {
      type: String,
      
      
    },
    contactNumber: {
      type: String,
      
    },
    cnicNumber: {
      type: String,
      
      
      
    },
    address: {
      type: String,
      
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
    amount: { type: Number },
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
   date: { type: Date, default: Date.now }
  },
  {
    timestamps: true, 
  }
);

// Index to speed due checker queries
transactionSchema.index({
  transactionType: 1,
  recycled: 1,
  "installments.status": 1,
  "installments.date": 1,
});

module.exports = mongoose.model("Transaction",transactionSchema);




// router.put("/update-transactions/:id", async (req, res) => {
//   try {

//     const sendSMS = async (recepient, transactionID, username, dueInstalmentAmount) => {
//       const myHeaders = new Headers();
//       myHeaders.append("Content-Type", "application/json");

//       const response = await fetch("https://api.textbee.dev/api/v1/gateway/devices/68cd1053546ea5f868e58fdd/send-sms", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-api-key": "392b0067-2f8b-4f9f-9acf-37c9ac8dd092"
//         },
//         body: JSON.stringify({
//           recipients: [recepient],
//           message:
//             `Hello ${username}\nYour Due Instalment Amount is ${dueInstalmentAmount}\nPlease visit the following URL to view your receipt\nhttps://kamran-mobile-zone.web.app/pdf/${transactionID}`
//         }),

//       });

//       const result = await response.json()
//       console.log(result);
      

//     }

//     let updatedTransaction = await Transactions.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },   // only update the provided fields
//       { new: true } // return updated doc & run schema validators
//     );

//     let newlyUpdatedTransaction = await Transactions.findById(req.params.id)

//     // console.log(newlyUpdatedTransaction);
    
//     let { installments } = newlyUpdatedTransaction

//     const currentDate = new Date();

//     // Helper function to format date as dd mm yy
//     const formatDate = (date) => {
//       const d = new Date(date);
//       const day = d.getDate();
//       const month = d.getMonth() + 1; // months are 0-indexed
//       const year = d.getFullYear();
//       return `${day}-${month}-${year}`;
//     };


//     const formattedCurrentDate = formatDate(currentDate);


//     for (let j = 0; j < installments.length; j++) {
//       const inst = installments[j];
//       const instDate = new Date(inst.date);
      
//       const formattedDueDate = formatDate(instDate);
//       // console.log("Formatted current",formattedCurrentDate,"formatted due",formattedDueDate);
      
//       // Compare dates (only day, month, year)
//       if (formattedCurrentDate === formattedDueDate && inst.status === "Pending") {
//         console.log("executed");
//         inst.status = "Due";
//         // sendSMS(req.body.contactNumber, req.body._id, req.body.fullName, priceConverter(inst.amount))
//       }
//     }

//     // console.log(newlyUpdatedTransaction);
    
//     await newlyUpdatedTransaction.save();
 
    

//     if (!updatedTransaction) {
//       return res.status(404).json({ success: false, message: "Transaction not found" });
//     }

//     res.json({ success: true, transaction: newlyUpdatedTransaction });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// });