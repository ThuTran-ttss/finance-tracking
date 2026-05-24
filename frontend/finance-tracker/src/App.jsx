import { useState, useEffect } from "react";
import axios from "axios";
import TransactionForm from "./TransactionForm";
import TransactionTable from "./TransactionTable";
import "./App.css";

function App() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:2302";
  const [transactions, setTransactions] = useState([]);
  
  // _____________State quản lý pagination trả về từ server_____________
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1 });

  const [data, setData] = useState({
    title: "",
    amount: "",
    category: "",
    paymentType: "",
    transactionType: "expenses",
    date: "",
  });

  const [filter, setFilter] = useState({
    transactionType: "all",
    category: "",
    date: "",
    page: 1 // _____________Thêm số trang vào bộ lọc_____________
  });

  // _____________Fetch dữ liệu từ API dựa theo bộ lọc Query Parameters của Server_____________
  const fetchTransactions = () => {
    const { transactionType, category, date, page } = filter;
    
    // _____________Xây dựng query string động_____________
    let queryParams = `?page=${page}&limit=10`;
    if (transactionType !== "all") queryParams += `&transactionType=${transactionType}`;
    if (category) queryParams += `&category=${encodeURIComponent(category)}`;
    if (date) queryParams += `&date=${date}`;

    axios
      .get(`${API_URL}/transactions${queryParams}`)
      .then((res) => {
        setTransactions(res.data.data); // _____________Backend trả về mảng nằm trong object .data_____________
        setPageInfo({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages
        });
      })
      .catch((err) => console.log("Unable to get data", err));
  };

  // _____________Mỗi khi filter thay đổi, tự động gọi lại API để lấy dữ liệu mới_____________
  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // _____________Validation trước khi gửi_____________
    if (!data.title || !data.amount || !data.date || !data.category) {
      alert("Vui lòng điền đầy đủ thông tin giao dịch!");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/transactions`, {
        ...data,
        amount: data.transactionType === "expenses" ? -Number(data.amount) : Number(data.amount),
      });

      // _____________ĐỒNG BỘ STATE: Thêm trực tiếp phần tử mới trả về_____________
      setTransactions((prev) => [response.data, ...prev]);

      // _____________Reset form_____________
      setData({
        title: "",
        amount: "",
        category: "",
        paymentType: "",
        transactionType: "expenses",
        date: "",
      });
    } catch (err) {
      console.log("Unable to add transaction", err);
    }
  };

  const handleDelete = async (_id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await axios.delete(`${API_URL}/transactions/${_id}`);
        // _____________Đồng bộ xóa phần tử khỏi UI ngay lập tức_____________
        setTransactions((prev) => prev.filter((trans) => trans._id !== _id));
      } catch (err) {
        console.log("Unable to delete transaction", err);
      }
    }
  };

  // _____________Tính toán tổng số tiền dựa trên dữ liệu hiện có_____________
  const totalIncome = transactions
    .filter((t) => t.transactionType === "income")
    .reduce((sum, t) => sum + t.amount, 0); 

  const totalExpenses = transactions
    .filter((t) => t.transactionType === "expenses")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <h1>Personal Finance Tracker</h1>
      <div className="dashboard">
        <TransactionForm handleSubmit={handleSubmit} data={data} setData={setData} />
        <TransactionTable
          transactions={transactions}
          filter={filter}
          setFilter={setFilter}
          pageInfo={pageInfo}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          totalBalance={totalBalance}
          handleDelete={handleDelete}
        />
      </div>
    </>
  );
}

export default App;