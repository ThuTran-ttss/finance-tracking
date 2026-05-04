import express from "express"; 
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Transaction from "./models/Transactions.js";

dotenv.config(); // đọc file .env

const app = express(); //tạo server

app.use(cors()); // cho React gọi backend
app.use(express.json()); //cho phép server đọc dữ liệu json từ req body

mongoose // connect MongoDB
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

app.get("/transactions",  async(req,res) => {
    const transactions = await Transaction.find();
    res.json(transactions);
}); 

app.post("/transactions", async(req,res) => { // tạo API endpoint POST, URL là transactions
    const newTrans = await Transaction.create({
        ...req.body
    });

    res.json(newTrans); // trả về front end
})

app.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm và xoá giao dịch theo ID trong MongoDB
    const deletedTransaction = await Transaction.findByIdAndDelete(id); 

    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 2302;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));