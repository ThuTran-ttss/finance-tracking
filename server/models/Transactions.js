import mongoose from "mongoose";

const transactionsSchema = new mongoose.Schema ({
    title: {
        type: String,
        required: true
    },
    
    amount: {
        type: Number,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    paymentType: {
        type: String,
        required: true
    },

    transactionType: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    }
});

const Transaction = mongoose.model(
  "Transaction",
  transactionsSchema
);

export default Transaction;