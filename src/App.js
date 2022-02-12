import './App.css';
import React from 'react';
import { useState, useEffect } from "react";
import { db } from './firebaseConfig';
import { addDoc, collection, getDocs, doc, updateDoc, increment, getDoc, deleteField } from "firebase/firestore";





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
  }

  return (
    <div className="App">
      <button id="add" onClick={addUpdate}>Add</button>
      <button id="spent" onClick={spentUpdate}>spent</button>
      <br />
      <br />
      <p id="statusText">{statusMsg}</p>
      <div>
        <h6>Wallet</h6>
        <p id="walletText">{pocketMoney}</p>
        <button onClick={resetWallet}>Reset</button>
      </div>
      <div>
        <h6>Spent</h6>
        <p id="spentText">{spentMoney}</p>
        <button onClick={resetSpent}>Reset</button>
      </div>
      <div>
        <h6>Record</h6>
        {arr.map(i => {
          return (
            <div key={records[i]}>

              {i}: {records[i]}

            </div>)
        })}
      </div>
    </div>
  );
}

export default App;
