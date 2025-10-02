const mongoose = require('mongoose')

const URI = 'mongodb+srv://mobile_installment:Tf67K7AJRfWIz9qq@cluster0.qyv45ob.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.set("strictQuery", false);
const connectToMongo = () => mongoose.connect(URI, () => {
    console.log("Connected to Mongo Successfully")
})

module.exports = connectToMongo