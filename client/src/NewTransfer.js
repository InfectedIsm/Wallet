import React, { useState } from 'react';

function NewTransfer({createTransfer}) {
  const [transfer, setTransfer] = useState(undefined);

  const submit = e => {
    e.preventDefault();
    createTransfer(transfer);
  }

  const updateTransfer = (e, field) => {
    const value = e.target.value;
    // by putting the "..." before transfer, we tell the function we just want to update the object
    setTransfer({...transfer, [field]: value});
  }

  return (
    <div>
      <h2>Create transfer</h2>
      <form onSubmit={e => submit(e)}>
        <label htmlFor="amount">Amount</label>
        <input 
          id="amount"
          type="text" 
          onChange={e => updateTransfer(e, 'amount')} 
        />
        <label htmlFor="to">To</label>
        <input 
          id="to"
          type="text" 
          onChange={e => updateTransfer(e, 'to')} 
        />
        <button>Submit</button>
      </form>
    </div>
  );
}

export default NewTransfer;