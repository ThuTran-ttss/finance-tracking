import { useState, useEffect } from "react";

function TransactionTable({
  transactions,
  filter,
  setFilter,
  pageInfo,
  totalIncome,
  totalExpenses,
  totalBalance,
  handleDelete,
}) {
  const [searchTerm, setSearchTerm] = useState(filter.category);
  
  // ______________Hàm format ngày từ ISO Object thành định dạng DD/MM/YYYY______________
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilter((prev) => ({ ...prev, category: searchTerm, page: 1 }));
    }, 500);

    return () => clearTimeout(delayDebounceFn); // _______Xóa bộ đếm nếu user tiếp tục gõ tiếp______
  }, [searchTerm]);

  return (
    <>
      <div className="summary">
        <div className="summary-card">
          <h3>Total Income</h3>
          <p style={{ color: "#10b981" }}>
            {totalIncome.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
          </p>
        </div>
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p style={{ color: "#ef4444" }}>
            {totalExpenses.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
          </p>
        </div>
        <div className="summary-card">
          <h3>Total Balance</h3>
          <p style={{ color: totalBalance >= 0 ? "#10b981" : "#ef4444" }}>
            {totalBalance.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
          </p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Transaction Name</th>
              <th>Amount</th>
              <th>
                <div className="header-content">
                  <span>Category</span>
                  <input 
                    type="text" 
                    placeholder="Search category..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: "4px", borderRadius: "4px", border: "1px solid #ccc", marginTop: "4px" }}
                  />
                </div>
              </th>
              <th>Payment Type</th>
              <th>
                <div className="header-content">
                  <span>Transaction Type</span>
                  <select
                    value={filter.transactionType}
                    onChange={(e) => setFilter({ ...filter, transactionType: e.target.value, page: 1 })}
                  >
                    <option value="all">All</option>
                    <option value="income">Income</option>
                    <option value="expenses">Expenses</option>
                  </select>
                </div>
              </th>
              <th>
                <div className="header-content">
                  <span>Date</span>
                  <input 
                    type="date"
                    value={filter.date}
                    onChange={(e) => setFilter({ ...filter, date: e.target.value, page: 1 })}
                  />
                </div>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>Không có dữ liệu giao dịch.</td>
              </tr>
            ) : (
              transactions.map((trans) => (
                <tr key={trans._id}>
                  <td>{trans.title}</td>
                  <td style={{ color: trans.transactionType === "income" ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                    {trans.amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                  </td>
                  <td>{trans.category}</td>
                  <td>{trans.paymentType}</td>
                  <td style={{ color: trans.transactionType === "income" ? "#10b981" : "#ef4444" }}>
                    {trans.transactionType}
                  </td>
                  <td>{formatDate(trans.date)}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(trans._id)}
                      style={{
                        backgroundColor: "#ff4d4d",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* ______________Bộ nút điều khiển chuyển trang Pagination UI______________ */}
        <div className="pagination" style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "15px" }}>
          <button 
            disabled={filter.page <= 1}
            onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
          >
            Previous
          </button>
          <span>Trang {pageInfo.currentPage} / {pageInfo.totalPages}</span>
          <button 
            disabled={filter.page >= pageInfo.totalPages}
            onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default TransactionTable;