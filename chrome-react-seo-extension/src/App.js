import './App.css';
import {useState} from 'react';
import {FiSettings} from 'react-icons/fi';
import {IoMdClose} from 'react-icons/io';
import {Wallet} from 'ethers';
import {Client} from '@xmtp/xmtp-js';

var wallet, xmtp;

export default function App() {
  const [activeLeft, setActiveLeft] = useState(0);
  const [settings, setSettings] = useState(localStorage.getItem("privateKey") === null);
  const [passwordNeeded, setPasswordNeeded] = useState(localStorage.getItem("privateKey") !== null && localStorage.getItem("privateKey").includes("cipher"));
  const [progressWidth, setProgressWidth] = useState(0);

  async function handlePrivateKey(privateKey, password) {
    try {
      wallet = new Wallet(privateKey);
      if (password) {
        let encrypted = await wallet.encrypt(password, setProgressWidth);
        localStorage.setItem("privateKey", encrypted);
      } else {
        localStorage.setItem("privateKey", privateKey);
      }
      console.log(wallet);
      reset();
      await activateXMTP();
    } catch(e) {
      alert("Invalid private key");
    }
  }

  // eslint-disable-next-line
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
    console.log(wallet);
    reset();
    await activateXMTP();
  }

  async function activateXMTP() {
    xmtp = await Client.create(wallet);
    await sendMessage("0xe2037FD7bEaF4E550C12719aDBdad50F39d3aAE5", "First Message", "uniswap.org")
  }

  async function sendMessage(address, message, website="None") {
    let conversation = await xmtp.conversations.newConversation(address);
    await conversation.send(website + "////" + message);
    await getAllMessages(address);
  }

  async function getAllMessages(address) {
    let conversation = await xmtp.conversations.newConversation(address);
    let messages = await conversation.messages();
    console.log(messages);
  }

  async function getAllConversations() {
    let allConversations = await xmtp.conversations.list();
    for (const conversation of allConversations) {
      console.log(conversation.peerAddress);
    }
  }

  function reset() {
    setPasswordNeeded(false);
    setSettings(false);
    setActiveLeft(0);
    setProgressWidth(0);
  }

  window.onload = function() {
    if (!passwordNeeded && localStorage.getItem("privateKey") !== null) {
      activateWallet("");
    }
  }

  return (
    <div className="App">
      {settings && <div className="Settings">
        {localStorage.getItem("privateKey") && <IoMdClose className="ClosePrivateKey Icon"
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

      <div className="LeftNav">
        <div className="LeftNavHeader">
          <span className="LeftNavHeaderOption"
            onClick={() => setActiveLeft(0)}
            style={{
              color: activeLeft === 0 ? "white" : "rgba(255,255,255,0.5)"
            }}>People</span>
          <span className="LeftNavHeaderOption"
            onClick={() => setActiveLeft(1)}
            style={{
              color: activeLeft === 1 ? "white" : "rgba(255,255,255,0.5)"
            }}>Sites</span>
          
          <FiSettings className="OpenSettings Icon"
            onClick={() => {
              setActiveLeft(2);
              setSettings(true);
            }}
            style={{
              color: activeLeft === 2 ? "white" : "rgba(255,255,255,0.5)"
            }}/>
        </div>

        <div className="NewMessage Option" onClick={() => {

        }}>New Message</div>
        <div className="Option Site">Words</div>
      </div>
      <div className="MiddleNav"></div>
    </div>
  );
}
