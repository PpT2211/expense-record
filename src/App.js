import './App.css';
import React from 'react';
import { useState, useEffect } from "react";
import { db } from './firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, increment, getDoc, deleteField } from "firebase/firestore";
import { FaWallet } from "react-icons/fa"
import { GiPayMoney } from "react-icons/gi"
import { BsFillJournalBookmarkFill } from "react-icons/bs"
// import { createRequire } from "module"

//For font scaling
// 1x - 14px
// 2x - 28px
// 3x - 42px
// 4x - 56px
// 5x - 70px

function App() {
  const [pocketMoney, setPocketMoney] = useState(0);
  const [spentMoney, setSpentMoney] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [records, setRecord] = useState({});
  const walletRef = doc(db, "wallet", "have");
  const recordRef = doc(db, "wallet", "database");
  var arr = Object.keys(records)

  useEffect(() => {
    const ini = async () => {
      const money = await getDocs(collection(db, "wallet"));
      const recs = await getDoc(recordRef);
      setPocketMoney(money.docs[1].data().amount)
      setSpentMoney(money.docs[1].data().spentAmount)
      setStatusMsg(status(money.docs[1].data().amount))
      setRecord(recs.data())
      arr = Object.keys(records)
    }
    ini()

  }, [])


  const status = (amt) => {
    if (amt > 1000) {
      return "Richboi ;)"
    } else if (amt >= 500) {
      return "Think before you spend";
    } else if (amt < 500) {
      return "You broke xD"
    }
  }

  const querySnapshot = async () => {
    const money = await getDocs(collection(db, "wallet"));
    const walletDisp = document.querySelector("#walletText");
    const spentDisp = document.querySelector("#spentText");
    const statusDisp = document.querySelector("#statusText");
    walletDisp.innerText = money.docs[1].data().amount;
    spentDisp.innerText = money.docs[1].data().spentAmount;
    statusDisp.innerText = status(money.docs[1].data().amount)
  }

  const addUpdate = async () => {
    var extra = parseInt(prompt("How much?"));
    const money = await getDocs(collection(db, "wallet"));
    var current = money.docs[1].data().amount
    if (isNaN(extra)) {
      extra = 0
    }
    await updateDoc(walletRef, {
      amount: increment(extra)
    });
    querySnapshot()
  }


  const takeRecord = async (onWhat, amt) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    var dt = new Date()
    var id = `${months[dt.getMonth()]} ${dt.getDate()}`
    var ndoc = {}
    if (records[id]) {
      ndoc[id] = `${records[id]}, ${amt} on ${onWhat}`
      records[id] = `${records[id]}, ${amt} on ${onWhat}`
    } else {
      ndoc[id] = `${amt} on ${onWhat}`
      records[id] = `${amt} on ${onWhat}`
    }
    arr = Object.keys(records)
    await updateDoc(recordRef, ndoc)
    console.log(arr)
  }

  const resetRecords = async () => {
    arr.map(async (date) => {
      await updateDoc(recordRef, {
        [date]: deleteField()
      })
    })
  }

  const spentUpdate = async () => {
    var extra = parseInt(prompt("How much?"));
    if (isNaN(extra)) {
      extra = 0
    } else {
      var rc = prompt("On what?")
      const money = await getDocs(collection(db, "wallet"));
      var current = money.docs[1].data().amount
      if (isNaN(extra)) {
        extra = 0
      }
      if (extra < current) {
        await updateDoc(walletRef, {
          amount: increment(-extra),
          spentAmount: increment(extra)
        });
        takeRecord(rc, extra)
        querySnapshot()
      }
      else {
        alert("You don't have that much money")
      }
    }
    window.location.reload(false);
  }

  const resetWallet = async () => {
    var confirmation = prompt("Are you sure?(y/n)")

    if (confirmation === "y") {
      await updateDoc(walletRef, {
        amount: 0
      })
      querySnapshot()
    }
    else if (confirmation === "n") {
      alert("Alright")
    }
    else {
      alert("Enter 'y' for yes and 'n' for no")
      resetWallet()

    }
    window.location.reload(false);
  }
  const resetSpent = async () => {
    var confirmation = prompt("Are you sure?(y/n)")
    if (confirmation == "y") {
      await updateDoc(walletRef, {
        spentAmount: 0
      })
      querySnapshot()
      resetRecords()
    }
    else if (confirmation == "n" || "N") {
      alert("Alright")
    }
    window.location.reload(false);
  }

  const editRecords = async (id, text) => {
    // var edited = prompt("Edit", text)
    const recs = await getDoc(recordRef);
    const edited = prompt("Edit", recs.data()[id])
    await updateDoc(recordRef, {
      [id]: edited
    })
    window.location.reload(false);
  }

  return (
    <div className="App">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />
      <div className='btn-group text-center'>
        <button className='btn btn-outline-light' id="add" onClick={addUpdate}>Add</button>
        <button className='btn btn-outline-light' id="spent" onClick={spentUpdate}>spent</button>
      </div>
      <br />
      <br />
      <p id="statusText">{statusMsg}</p>
      <div className='amount-box text-center'>
        <FaWallet size={28} />
        <h6>Wallet</h6>
        <p id="walletText">{pocketMoney}</p>
        <button className='btn btn-outline-light' onClick={resetWallet}>Reset</button>
      </div>
      <br />
      <div>
        <GiPayMoney size={42} />
        <h6>Spent</h6>
        <p id="spentText">{spentMoney}</p>
        <button className='btn btn-outline-light' onClick={resetSpent}>Reset</button>
      </div>
      <br />
      <div>
        <BsFillJournalBookmarkFill size={42} />
        <h6>Record</h6>
        <section>
          {arr.map(i => {
            return (
              <div className='block'>
                <div className='center txn-history'>
                  <div key={records[i]} className='txn-list'>

                    {i}: <span className='credit-amount'>{records[i]}</span>

                  </div>
                  <button className='btn btn-outline-light' onClick={() => { editRecords(i, records[i]) }}>Edit</button>
                </div>
              </div>
            )
          })}</section>
      </div>
    </div>
  );
}

export default App;
