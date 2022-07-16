import './App.css';
import {useEffect, useState} from 'react';
import {FiSettings, FiSmartphone} from 'react-icons/fi';
import {IoMdClose} from 'react-icons/io';
import {Wallet} from 'ethers';
import { Client } from '@xmtp/xmtp-js'

var wallet;
var xmtp;

export default function App() {
  const [activeLeft, setActiveLeft] = useState(0);
  const [settings, setSettings] = useState(localStorage.getItem("privateKey") === null);
  const [passwordNeeded, setPasswordNeeded] = useState(localStorage.getItem("privateKey") !== null && localStorage.getItem("privateKey").includes("cipher"));
  const [progressWidth, setProgressWidth] = useState(0);


  async function handlePrivateKey(privateKey, password) {
    try {
      wallet = new Wallet(privateKey);
      if (password !== "") {
        let encrypted = await wallet.encrypt(password, setProgressWidth);
        localStorage.setItem("privateKey", encrypted);
      } else {
        localStorage.setItem("privateKey", privateKey); // encrypt with some default value
      }
      reset();
      createNewClient(privateKey)
    } catch(e) {
      alert("Invalid private key");
    }
  }

  async function createNewClient(privateKey) {
    try {
      xmtp = await Client.create(wallet);
    } catch(e) {
      alert("Cannot create client");
    }
  }

  async function sendMessage(publicKey, message) {
    try {
      const convo = await xmtp.conversations.newConversation(publicKey);
      await convo.send(message);
      getMessages(publicKey);
    } catch(e) {
      alert("Recipient is not on XMTP network.")
    }
    reset();
  }

  async function getConversations() {
    try {
      const convos = await xmtp.conversations.list();
      console.log(convos);
      // var addresses = [];
      // var i = 0;
      // for (const convo of await convos.messages()) {
      //   addresses[i] = convo.peerAddress;
      //   i += 1;
      // }
      // addresses.forEach(function(item) {
      //   var li = document.createElement("li");
      //   var text = document.createTextNode(item);
      //   li.appendChild(text);
      //   document.getElementById("addresses").appendChild(li);
      // });
    } catch(e) {
      console.log(e);
    }
  }

  async function getMessages(publicKey) {
    try {
      const convo = await xmtp.conversations.newConversation(publicKey);
      var messages = [];
      var i = 0;
      for (const message of await convo.messages()) {
          messages[i] = message;
          i += 1;
      }

      messages.forEach(function(item) {
        var li = document.createElement("li");
        var text = document.createTextNode(item.content);
        li.appendChild(text);
        document.getElementById("messages").appendChild(li);
      });
    } catch(e) {
      console.log(e);
    }
  }

  async function activateWallet(password) {
    if (password !== "") {
      try {
        wallet = await Wallet.fromEncryptedJson(localStorage.getItem("privateKey"), password, setProgressWidth);
      } catch(e) {
        alert("Invalid password");
      }
    } else {
      wallet = new Wallet(localStorage.getItem("privateKey"));
    }
    reset();
    createNewClient(localStorage.getItem("privateKey"))
  }

  function reset() {
    setPasswordNeeded(false);
    setSettings(false);
    setActiveLeft(0);
    setProgressWidth(0);
  }

  useEffect(() => {
    if (!passwordNeeded && localStorage.getItem("privateKey") !== null) {
      activateWallet("");
    }
  }, [activateWallet, passwordNeeded])

  return (
    <div className="App">
      {settings && <div className="Settings">
        {localStorage.getItem("privateKey") !== null && <IoMdClose className="ClosePrivateKey Icon"
          onClick={() => {
            reset();
          }}/>}
        <div className="Progress" id="PrivateKeyProgress"
          style={{
            width: progressWidth * 500 + "px"
          }}></div>
        <input className="SettingsInput" id="PrivateKey" type="text" autoComplete="off" placeholder="Private Key"></input>
        <input className="SettingsInput" id="Password" type="text" autoComplete="off" placeholder="Password"></input>
        <button className="Save SaveSettings"
          onClick={() => {
            handlePrivateKey(document.getElementById("PrivateKey").value, document.getElementById("Password").value);
          }}>Save</button>
      </div>}

      {passwordNeeded && <div className="InitialPassword">
          <div className="Progress" id="PasswordProgress"
            style={{
              width: progressWidth * 500 + "px"
            }}></div>
          <input className="SettingsInput" id="InitialPassword" type="text" autoComplete="off" placeholder="Password"></input>
          <button className="Save SavePassword"
            onClick={() => {
              activateWallet(document.getElementById("InitialPassword").value);
            }}>Enter</button>
      </div>}

      {activeLeft===1 && !passwordNeeded && <div className="Settings">
        {localStorage.getItem("privateKey") !== null && <IoMdClose className="ClosePrivateKey Icon"
          onClick={() => {
            reset();
          }}/>}
        <div className="Progress" id="PrivateKeyProgress"
          style={{
            width: progressWidth * 500 + "px"
          }}></div>
        <input className="SettingsInput" id="PublicKey" type="text" autoComplete="off" placeholder="Public Key"></input>
        <input className="SettingsInput" id="Message" type="text" autoComplete="off" placeholder="Message"></input>
        <button className="Save SaveSettings"
          onClick={() => {
            sendMessage(document.getElementById("PublicKey").value, document.getElementById("Message").value);
          }}>Save</button>
      </div>}

      <div className="LeftNav">
        <div className="LeftNavHeader">
          <span className="LeftNavHeaderOption"
            onClick={() => {
              setActiveLeft(1)
            }}
            style={{
              color: activeLeft === 0 ? "white" : "rgba(255,255,255,0.5)"
            }}>Message</span>
          <span className="LeftNavHeaderOption"
            onClick={() => {
              getConversations()
            }}
            style={{
              color: activeLeft === 1 ? "white" : "rgba(255,255,255,0.5)"
            }}>Load</span>
          <FiSettings className="OpenSettings Icon"
            onClick={() => {
              setActiveLeft(3);
              setSettings(true);
            }}
            style={{
              color: activeLeft === 3 ? "white" : "rgba(255,255,255,0.5)"
            }}/>
        </div>
      </div>
      <div className="MiddleNav">
        <ul id="messages"></ul>
      </div>
    </div>
  );
}
