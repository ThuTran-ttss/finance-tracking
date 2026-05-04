import { useState, useEffect } from "react";
import axios from "axios";
import TransactionForm from "./TransactionForm";
import TransactionTable from "./TransactionTable";
import "./App.css";

function App() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:2302"; 

  const [transactions, setTransactions] = useState([]);

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
  });

  const filterTransactions = transactions.filter((trans) => {
    const matchCategory =
      filter.category === "" || trans.category === filter.category;
    const matchDate = filter.date === "" || trans.date === filter.date;
    const matchTransactionType =
      filter.transactionType === "all" ||
      trans.transactionType === filter.transactionType;
    return matchCategory && matchDate && matchTransactionType;
  });

  useEffect(() => {
    axios
      .get(`${API_URL}/transactions`)
      .then((res) => setTransactions(res.data))
      .catch((err) => console.log("Unable to get data", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post(`${API_URL}/transactions`, {
      ...data,
      amount:
        data.transactionType === "expenses"
          ? -Number(data.amount)
          : Number(data.amount),
    });

    const response = await axios.get(`${API_URL}/transactions`);
    setTransactions(response.data);

    setData({
      title: "",
      amount: "",
      category: "",
      paymentType: "",
      transactionType: "expenses",
      date: "",
    });
  };

  const handleDelete = async (_id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await axios.delete(`${API_URL}/transactions/${_id}`);;
        setTransactions(transactions.filter((trans) => trans._id !== _id));
      } catch (err) {
        console.log("Unable to delete transaction", err);
      }
    }
  };

const totalIncome = transactions
    .filter((t) => t.transactionType === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = transactions
    .filter((t) => t.transactionType === "expenses")
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const totalBalance = transactions.reduce(
    (sum, transaction) => sum + (Number(transaction.amount) || 0),
    0
  );

  const totalFilterBalance = filterTransactions.reduce(
    (sum, transaction) => sum + (Number(transaction.amount) || 0),
    0
  );

  return (
    <>
      <h1>Personal Finance Tracker</h1>
      <div className="dashboard">
        <TransactionForm
          handleSubmit={handleSubmit}
          data={data}
          setData={setData}
        />
        <TransactionTable
          transactions={transactions}
          filter={filter}
          setFilter={setFilter}
          filterTransactions={filterTransactions}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          totalBalance={totalBalance}
          totalFilterBalance={totalFilterBalance}
          handleDelete={handleDelete}
        />
      </div>
    </>
  );
}

export default App;
