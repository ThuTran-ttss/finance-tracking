import { useState } from 'react';

function TransactionForm({ handleSubmit, data, setData }) {
  return (
    <form onSubmit={handleSubmit}>
      <input 
        placeholder='What is your transactions?'
        value={data.title}
        onChange={(e) => setData({...data, title: e.target.value})}
      />
      <input 
        placeholder='Please input the amount of money..' 
        type='number'
        value={data.amount}
        onChange={(e) => setData({...data, amount: e.target.value})}
      />
      <input 
        placeholder='Category'
        value={data.category}
        onChange ={(e) => setData({...data, category: e.target.value})}
      />
      <input 
        placeholder='Payment Type'
        value={data.paymentType}
        onChange={(e)=> setData({...data, paymentType: e.target.value})}
      />
      <select
        value={data.transactionType}
        onChange ={(e) => setData({...data, transactionType: e.target.value})}>
          <option value="expenses"> Expenses </option>
          <option value="income"> Income </option> 
      </select>
      <input 
        placeholder='Date'
        type='date'
        value={data.date}
        onChange={(e) => setData({...data, date: e.target.value})}
      />
      <button type='submit'> Add Transaction </button>
    </form>
  );
}

export default TransactionForm;
