import mongoose from "mongoose";

const transactionsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  paymentType: {
    type: String,
    required: true,
    trim: true
  },
  transactionType: {
    type: String,
    required: true,
    enum: ["income", "expenses"] // Chỉ lưu vào database khi là income hoặc expenses
  },
  date: {
    type: Date, // For better time filter
    required: true
  }
});

const Transaction = mongoose.model("Transaction", transactionsSchema);
export default Transaction;