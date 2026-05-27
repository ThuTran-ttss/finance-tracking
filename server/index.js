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
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10; 

    const { category, transactionType, date } = req.query;

    // Tạo object bộ lọc động
    let queryFilter = {};
    if (category) {
        queryFilter.category = { $regex: category, $options: "i" };//tìm tương đối (Regex) không phân biệt hoa thường
      }
    
    if (transactionType && transactionType !== "all") {
        queryFilter.transactionType = transactionType;
      }

    if (date) { // Validate ép kiểu Date 
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        queryFilter.date = parsedDate;
      }
    }

    // _________________Tính số bản ghi cần bỏ qua (skip)_________________
    const skip = (page - 1) * limit;

    // _________________Lấy dữ liệu đã paginate và tổng số transactions để Frontend làm UI bấm chuyển trang_________________
    //  Gom 3 tác vụ chạy song song tối ưu hiệu năng bằng Promise.all
    const [transactions, totalRecords, summaryData] = await Promise.all([
      // Tác vụ 1: Lấy dữ liệu phân trang
      Transaction.find(queryFilter).sort({ date: -1 }).skip(skip).limit(limit),
      
      // Tác vụ 2: Đếm tổng số lượng bản ghi phục vụ UI phân trang
      Transaction.countDocuments(queryFilter),
      
      // Tác vụ 3: Tính toán tổng tiền thực tế trên DB 
      Transaction.aggregate([
        { $match: queryFilter },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: { $cond: [{ $eq: ["$transactionType", "income"] }, "$amount", 0] }
            },
            totalExpenses: {
              $sum: { $cond: [{ $eq: ["$transactionType", "expenses"] }, { $abs: "$amount" }, 0] }
            },
            totalBalance: { $sum: "$amount" }
          }
        }
      ])
    ]);

    // Bóc tách kết quả tính tổng (Nếu DB trống thì gán mặc định bằng 0)
    const summary = summaryData[0] || { totalIncome: 0, totalExpenses: 0, totalBalance: 0 };

    res.json({
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      summary,
      data: transactions
    });
  } catch (err) {
    res.status(500).json({ error: "Server Errors: " + err.message });
  }
});

// _________________API POST: Bảo mật dữ liệu bằng Destructuring, chống Mass Assignment_________________
app.post("/transactions", async (req, res) => {
  try {
    const { title, amount, category, paymentType, transactionType, date } = req.body;

    // _________________Validation _________________
    if (!title || !amount || !category || !paymentType || !transactionType || !date) {
      return res.status(400).json({ message: "Please input all required fields!" });
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
    res.status(500).json({ error: "Server Errors: " + err.message });
  }
});

// _________________API DELETE: Xóa giao dịch theo ID_________________
app.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    
    if (!deletedTransaction) {
      return res.status(404).json({ message: "Cannot find transactions!" });
    }
    res.status(200).json({ message: "Deleted!" });
  } catch (err) {
    res.status(500).json({ error: "Server Errors: " + err.message });
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