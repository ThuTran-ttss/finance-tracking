function TransactionTable({
  transactions,
  filter,
  setFilter,
  filterTransactions,
  totalIncome,
  totalExpenses,
  totalBalance,
  totalFilterBalance,
  handleDelete,
}) {
  return (
    <>
      <div className="summary">
        <div className="summary-card">
          <h3>Total Income</h3>
          <p style={{ color: "#10b981" }}>
            {totalIncome.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </p>
        </div>
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p style={{ color: "#ef4444" }}>
            {totalExpenses.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </p>
        </div>
        <div className="summary-card">
          <h3>Total Balance</h3>
          <p style={{ color: totalBalance >= 0 ? 
            "#10b981" : "#ef4444" }}>
            {totalBalance.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
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
                  <select
                    value={filter.category}
                    onChange={(e) =>
                      setFilter({ ...filter, category: e.target.value })
                    }
                  >
                    <option value="">All</option>
                    {[...new Set(transactions.map((trans) => trans.category))]
                      .filter(Boolean)
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>
              </th>
              <th>Payment Type</th>
              <th>
                <div className="header-content">
                  <span>Transaction Type</span>
                  <select
                    value={filter.transactionType}
                    onChange={(e) =>
                      setFilter({ ...filter, transactionType: e.target.value })
                    }
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
                  <select
                    value={filter.date}
                    onChange={(e) =>
                      setFilter({ ...filter, date: e.target.value })
                    }
                  >
                    <option value="">All</option>
                    {[...new Set(transactions.map((trans) => trans.date))]
                      .filter(Boolean)
                      .map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>
              </th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filterTransactions.map((trans) => (
              <tr key={trans._id}>
                <td>{trans.title}</td>
                <td style={{ color: trans.transactionType === "income" ? 
                  "#10b981" : "#ef4444", fontWeight: "bold" }}>
                  {trans.amount.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </td>
                <td>{trans.category}</td>
                <td>{trans.paymentType}</td>
                <td style={{ color: trans.transactionType === "income" ? 
                  "#10b981" : "#ef4444" }}>
                  {trans.transactionType}
                </td>
                <td>{trans.date}</td>
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
            ))}

            <tr>
              <td><strong>Filtered Balance</strong></td>
              <td style={{ color: totalFilterBalance >= 0 ? 
                "#10b981" : "#ef4444" }}>
                <strong>
                  {totalFilterBalance.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </strong>
              </td>
              <td colSpan="5"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default TransactionTable;
