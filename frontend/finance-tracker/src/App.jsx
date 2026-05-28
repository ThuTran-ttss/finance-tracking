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
  // ______________Lưu thông số tổng______________________
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, totalBalance: 0 });


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
    let queryParams = `?page=${page}&limit=10`;
    if (transactionType !== "all") queryParams += `&transactionType=${transactionType}`;
    if (category) queryParams += `&category=${encodeURIComponent(category)}`;
    if (date) queryParams += `&date=${date}`;

    axios
      .get(`${API_URL}/transactions${queryParams}`)
      .then((res) => {
        setTransactions(res.data.data);
        setPageInfo({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages
        });
        // _________________ĐỒNG BỘ DỮ LIỆU TỔNG: Nhận từ Backend trả về___________
        setSummary({
          totalIncome: res.data.summary.totalIncome,
          totalExpenses: res.data.summary.totalExpenses,
          totalBalance: res.data.summary.totalBalance
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
    if (!data.title || !data.amount || !data.date || !data.category) {
      alert("Please fill all required data!");
      return;
    }
    try {
      await axios.post(`${API_URL}/transactions`, {
        ...data,
        amount: data.transactionType === "expenses" ? -Number(data.amount) : Number(data.amount),
      });

      //_______Gọi lại API để load lại trang 1 với dữ liệu mới nhất_______
      setFilter((prev) => ({ ...prev, page: 1 })); 
      fetchTransactions(); 

      // __________Reset form__________
      setData({ title: "", amount: "", category: "", paymentType: "", transactionType: "expenses", date: "" });
    } catch (err) {
      console.log("Unable to add transaction", err);
    }
  };


  const handleDelete = async (_id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await axios.delete(`${API_URL}/transactions/${_id}`);
        //_________Gọi lại API để tự động bù dữ liệu trang sau lên trang hiện tại__________
        fetchTransactions(); 
      } catch (err) {
        console.log("Unable to delete transaction", err);
      }
    }
  };

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
          totalIncome={summary.totalIncome}
          totalExpenses={summary.totalExpenses}
          totalBalance={summary.totalBalance}
          handleDelete={handleDelete}
        />
      </div>
    </>
  );
}

export default App;