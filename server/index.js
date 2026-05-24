import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Transaction from "./models/Transactions.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 2302;

//_________________API GET: Bao gồm cả Server-side Filtering và Pagination_________________
// Xử lý được dữ liệu lớn hơn so với Client-side Filtering
app.get("/transactions", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category, transactionType, date } = req.query;

    // Tạo object bộ lọc động
    let queryFilter = {};
    if (category) queryFilter.category = category;
    if (transactionType && transactionType !== "all") queryFilter.transactionType = transactionType;
    if (date) queryFilter.date = new Date(date);

    // _________________Tính số bản ghi cần bỏ qua (skip)_________________
    const skip = (page - 1) * limit;

    // _________________Lấy dữ liệu đã paginate và tổng số transactions để Frontend làm UI bấm chuyển trang_________________
    const transactions = await Transaction.find(queryFilter)
                                          .sort({ date: -1 }) // _________________Sắp xếp ngày mới nhất lên đầu
                                          .skip(skip)
                                          .limit(limit);
                                          
    const totalRecords = await Transaction.countDocuments(queryFilter);

    res.json({
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      data: transactions
    });
  } catch (err) {
    res.status(500).json({ error: "Lỗi Server khi lấy dữ liệu: " + err.message });
  }
});

// _________________API POST: Bảo mật dữ liệu bằng Destructuring, chống Mass Assignment_________________
app.post("/transactions", async (req, res) => {
  try {
    const { title, amount, category, paymentType, transactionType, date } = req.body;

    // _________________Validation _________________
    if (!title || !amount || !category || !paymentType || !transactionType || !date) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc!" });
    }

    const newTrans = await Transaction.create({
      title,
      amount,
      category,
      paymentType,
      transactionType,
      date: new Date(date) // _________________Đảm bảo lưu vào DB dưới dạng Object Date_________________
    });

    res.status(201).json(newTrans);
  } catch (err) {
    res.status(500).json({ error: "Lỗi Server khi tạo giao dịch: " + err.message });
  }
});

// _________________API DELETE: Xóa giao dịch theo ID_________________
app.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    
    if (!deletedTransaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch để xóa!" });
    }
    res.status(200).json({ message: "Xóa thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi Server khi xóa: " + err.message });
  }
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log("MongoDB connection error:", err);
  }
};

startServer();