import './App.css';
import {useEffect, useState} from 'react';
import {FiSettings} from 'react-icons/fi';
import {IoMdClose} from 'react-icons/io';
import {Wallet} from 'ethers';

var wallet;

export default function App() {
  const [activeLeft, setActiveLeft] = useState(0);
  const [settings, setSettings] = useState(localStorage.getItem("privateKey") === null);
  const [passwordNeeded, setPasswordNeeded] = useState(localStorage.getItem("privateKey") !== null && localStorage.getItem("privateKey").includes("cipher"));
  const [progressWidth, setProgressWidth] = useState(0);

  async function handlePrivateKey(privateKey, password) {
    wallet = new Wallet(privateKey);
    if (password !== "") {
      let encrypted = await wallet.encrypt(password, setProgressWidth);
      localStorage.setItem("privateKey", encrypted);
    } else {
      localStorage.setItem("privateKey", privateKey);
    }
    console.log(wallet);
    setSettings(false);
    setActiveLeft(0);
  }

  async function activateWallet(password) {
    if (password !== "") {
      wallet = await Wallet.fromEncryptedJson(localStorage.getItem("privateKey"), password, setProgressWidth);
    } else {
      wallet = new Wallet(localStorage.getItem("privateKey"));
    }
    console.log(wallet);
    setPasswordNeeded(false);
    setActiveLeft(0);
  }

  useEffect(() => {
    if (!passwordNeeded && localStorage.getItem("privateKey") !== null) {
      activateWallet("");
    }
  }, [passwordNeeded])

  return (
    <div className="App">
      {settings && <div className="Settings">
        <IoMdClose className="ClosePrivateKey Icon"
          onClick={() => {
            setSettings(false);
            setActiveLeft(0);
          }}/>
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
            }}>Sites</span>
          <span className="LeftNavHeaderOption"
            onClick={() => setActiveLeft(1)}
            style={{
              color: activeLeft === 1 ? "white" : "rgba(255,255,255,0.5)"
            }}>People</span>
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
      <div className="MiddleNav"></div>
    </div>
  );
}
