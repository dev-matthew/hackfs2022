import './App.css';
import {useState} from 'react';
import {FiSettings} from 'react-icons/fi';
import {IoMdClose} from 'react-icons/io';
import {Wallet} from 'ethers';
import {Client} from '@xmtp/xmtp-js';
import {Web3Storage} from 'web3.storage/dist/bundle.esm.min.js';

const EXTENSION_NAME = "";
const COVALENT_KEY = "ckey_79c997c7e8084e0f9df0af9824c";
const WEB3_STORAGE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY1Nzc1NjBhMjU5ZTVFNkY5ZGY2OUI5MjUzNzg3NjBlM2NiMzE1OTMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTgyOTA2ODQwMDYsIm5hbWUiOiJIYWNrRlMyMDIyIn0.pV0ewTBjRB2MVpB8Dkiu8McnSNTCQvVSLeMr8RfVgsM";
const NFT_PORT_KEY = "ea1e18b5-7e10-4dd5-8354-9198453d55e8";
const CHAIN_ID = 137; //mumbai 80001, polygon 137

var wallet, xmtp;
var conversations = [];
var sites = {"all": []};
var activeMessages;
var myAddress;

export default function App() {
  const [activeLeft, setActiveLeft] = useState(0);
  const [settings, setSettings] = useState(localStorage.getItem("privateKey") === null);
  const [passwordNeeded, setPasswordNeeded] = useState(localStorage.getItem("privateKey") !== null && localStorage.getItem("privateKey").includes("cipher"));
  const [progressWidth, setProgressWidth] = useState(0);
  const [loadedPeople, setLoadedPeople] = useState(false);
  const [loadedSites, setLoadedSites] = useState(false);
  const [loadedMessages, setLoadedMessages] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [currentWebsite, setCurrentWebsite] = useState("");
  const [newConversationPopup, setNewConversationPopup] = useState(false);
  const [lookupPopup, setLookupPopup] = useState(false);
  const [currentNFTs, setCurrentNFTs] = useState([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [mintingNFTPopup, setMintingNFTPopup] = useState(false);
  const [mintStatus, setMintStatus] = useState("Awaiting command...");

  async function handlePrivateKey(privateKey, password) {
    try {
      wallet = new Wallet(privateKey);
      if (password) {
        let encrypted = await wallet.encrypt(password, setProgressWidth);
        localStorage.setItem("privateKey", encrypted);
        // eslint-disable-next-line
        //chrome.storage.local.set({"privateKey": encrypted}, function() {});
      } else {
        localStorage.setItem("privateKey", privateKey);
        // eslint-disable-next-line
        //chrome.storage.local.set({"privateKey": privateKey}, function() {});
      }
      console.log(wallet);
      reset();
      await activateXMTP();
    } catch(e) {
      alert("Invalid private key");
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
    console.log(wallet);
    reset();
    await activateXMTP();
  }

  async function activateXMTP() {
    myAddress = wallet.address;
    xmtp = await Client.create(wallet);
    console.log(xmtp);
    await getAllConversations();
    //await sendMessage("0xf82e053D56Ce2feF2EA52d2f120b706A66963327", "Hi this is Person 1 speaking", "google.com")
  }

  async function sendMessage(address, message, website="all") {
    try {
      if (website === "") {
        website = "all"
      }
      let conversation = await xmtp.conversations.newConversation(address);
      await conversation.send(website + "////" + message);
      console.log("Sent message " + message + " to " + address);
    } catch (e) {
      alert("Address is not on the XMTP network yet");
    }
  }

  async function getAllMessages(address) {
    let conversation = await xmtp.conversations.newConversation(address);
    let messages = await conversation.messages();
    return messages;
  }

  async function getAllConversations() {
    let allConversations = await xmtp.conversations.list();
    for (const conversation of allConversations) {
      conversations.push(conversation);
    }
    setLoadedPeople(true);
    console.log(conversations);
  }

  async function loadMessageByPerson(conversation) {
    sites = {"all": []};
    console.log(conversation);
    let messages = await getAllMessages(conversation.peerAddress);
    setCurrentAddress(conversation.peerAddress);
    console.log(messages);
    for (const message of messages) {
      let contents = message.content.split("////");
      let site, content;
      if (contents.length > 1) {
        site = contents[0];
        content = contents[1];
      } else {
        site = "all";
        content = contents[0];
      }

      let sender;
      if (message.senderAddress === myAddress) {
        sender = "Me - "
      } else {
        sender = message.senderAddress.substring(0, 6) + "..." + message.senderAddress.slice(-4) + " - ";
      }

      if (site in sites) {
        sites[site].push(sender + content);
      } else {
        sites[site] = [sender + content];
      }
      
      if (site !== "all") {
        sites["all"].push(sender + content);
      }
    }

    console.log(sites);
    setLoadedSites(false);
    setLoadedSites(true);
  }

  async function displayMessages(site="all") {
    activeMessages = sites[site];
    setCurrentWebsite(site);
    setLoadedMessages(false);
    setLoadedMessages(true);
  }

  function reset() {
    setPasswordNeeded(false);
    setSettings(false);
    setActiveLeft(0);
    setProgressWidth(0);
    setNewConversationPopup(false);
    setLookupPopup(false);
    setMintingNFTPopup(false);
    setMintStatus("Awaiting command...");
  }

  function isolateWebsite(address) {
    let url = new URL(address);
    return url.host
  }

  async function getNFTs(address) {
    try {
      //let conversation = await xmtp.conversations.newConversation(address);
      setLoadingNFTs(true);
      let nfts = [];
      fetch(`https://api.covalenthq.com/v1/${CHAIN_ID}/address/${address}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=${COVALENT_KEY}`)
        .then(response => response.json())
        .then(data => {
          console.log(data.data.items);
          for (let i = 0; i < data.data.items.length; i++) {
            let nft = data.data.items[i];
            if (nft.type === "nft" && nft.nft_data && nft.nft_data[0].external_data && nft.nft_data[0].external_data.name && nft.nft_data[0].external_data.name.includes(EXTENSION_NAME)) {
              nfts.push(nft);
            }
          }
          console.log(nfts);
          setCurrentNFTs(nfts);
          setLoadingNFTs(false);
        });
    } catch (error) {
      alert("User is not on the XMTP network yet");
    }
  }

  function loadImage(mint) {
    try {
      fetch(`https://favicongrabber.com/api/grab/${document.getElementById("CurrentWebsiteInput").value}`, {method: "GET", mode: "cors"})
      .then(response => response.json())
      .then(data => {
        console.log(data.icons[0].src);
        var canvas = document.getElementsByClassName("NFTPreview")[0];
        canvas.width = canvas.height * (canvas.clientWidth / canvas.clientHeight);
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        var imageObj1 = new Image();
        imageObj1.src = "https://i.imgur.com/ZP5RI97.png";
        imageObj1.crossOrigin = "Anonymous";
        imageObj1.onload = function() {
          context.drawImage(imageObj1, -7, -5, 164, 164);
          context.beginPath();
          context.arc(76, 76, 42, 0, 2 * Math.PI, false);
          context.fillStyle = "white";
          context.fill();
          context.lineWidth = 5;
          context.strokeStyle = "white";
          context.stroke();
          var imageObj2 = new Image();
          imageObj2.src = data.icons[0].src;
          imageObj2.crossOrigin = "Anonymous";
          imageObj2.onload = function() {
            context.drawImage(imageObj2, 36, 36, 82, 82);
            if (mint) {
              mintNFT(document.getElementById("CurrentWebsiteInput").value);
            }
          }
        }
      });
    } catch (error) {
      alert(error);
    }
  }

  async function mintNFT(url) {
    let canvas = document.getElementsByClassName("NFTPreview")[0];
    canvas.toBlob(function(blob) {
      uploadImage(blob, url);
    })
  }

  async function uploadImage(blob, url) {
    setMintStatus("Uploading to web3.storage...");
    console.log(blob);
    let web3StorageClient = new Web3Storage({token: WEB3_STORAGE_KEY});
    let file = new File([blob], "nft.png");
    console.log(file);
    const rootCid = await web3StorageClient.put([file]);
    console.log(rootCid);

    let IPFS_URL = `https://ipfs.io/ipfs/${rootCid}/nft.png`
    console.log(IPFS_URL);
    await handleMint(url, IPFS_URL);
  }

  async function handleMint(domain, image_url) {
    setMintStatus("Minting with NFTPort...")
    let data = {
      "chain": "polygon",
      "name": "Noir - " + domain,
      "description": "Minted via Noir for being a user of " + domain,
      "file_url": image_url,
      "mint_to_address": myAddress
    }

    fetch("https://api.nftport.xyz/v0/mints/easy/urls", {
      method: "POST",
      headers: {
        "Authorization": NFT_PORT_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then(response => response.json())
    .then(data => {
      console.log(data);
      setMintStatus("Success!");
    });
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

      {newConversationPopup && <div className="NewConversationPopup">
        <IoMdClose className="ClosePrivateKey Icon"
          onClick={() => {
            reset();
          }}/>
        <input className="SettingsInput" id="ToAddress" type="text" autoComplete="off" placeholder="Message Recipient"></input>
        <input className="SettingsInput" id="ToWebsite" type="text" autoComplete="off" placeholder="Website (Optional)"></input>
        <button className="CurrentWebsite"
          onClick={() => {
            // eslint-disable-next-line
            chrome.tabs && chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                document.getElementById("ToWebsite").value = isolateWebsite(tabs[0].url);
            });
          }}>Current</button>
        <input className="SettingsInput" id="ToMessage" type="text" autoComplete="off" placeholder="Message"></input>
        <button className="Save SendMessage"
            onClick={() => {
              sendMessage(
                document.getElementById("ToAddress").value,
                document.getElementById("ToMessage").value,
                document.getElementById("ToWebsite").value
              );
              reset();
            }}>Send</button>
      </div>}

      {lookupPopup && <div className="LookupPopup">
        <IoMdClose className="ClosePrivateKey Icon"
          onClick={() => {
            reset();
          }}/>
        <input className="SettingsInput" id="SearchAddress" type="text" autoComplete="off" placeholder="Enter address to search"
          onKeyPress={event => {
            if (event.key === "Enter") {
              try {
                getNFTs(document.getElementById("SearchAddress").value);
              } catch(e) {
                alert(e);
              }
            }
          }}
        ></input>
        {!loadingNFTs ? (<div className="NFTs">
          {currentNFTs.map((nft, index) => 
            <div className="NFT" key={index}
              style={{
                left: 20 + (index % 3) * 189 + "px",
                top: 10 + Math.floor(index / 3) * 154 + "px"
              }}
            >
              <img className="NFTImage" src={nft.nft_data[0].external_data.image} alt={nft.nft_data[0].external_data.name}></img>
              <span className="NFTText">{nft.nft_data[0].external_data.name}</span>
            </div>
          )}
        </div>) : (<div className="LoadingNFTs">Loading...</div>)}
      </div>}

      {mintingNFTPopup && <div className="MintPopup">
        <IoMdClose className="ClosePrivateKey Icon"
          onClick={() => {
            reset();
          }}/>
        <input className="SettingsInput" id="CurrentWebsiteInput" type="text" placeholder="Enter full URL"></input>
        <button className="CurrentWebsite MintCurrentWebsite"
          onClick={() => {
            // eslint-disable-next-line
            chrome.tabs && chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              document.getElementById("CurrentWebsiteInput").value = isolateWebsite(tabs[0].url);
            });
          }}>Current</button>
        <button className="Save DisplayButton" onClick={() => {
          loadImage(false);
        }}>Display</button>
        <button className="Save MintButton" onClick={() => {
          loadImage(true);
        }}>Mint</button>
        <span className="MintStatus">{mintStatus}</span>
        <canvas className="NFTPreview"></canvas>
      </div>}

      <div className="GlobalHeader">
        <span className="MyAddress" title={myAddress}>{(myAddress && "Logged in as " + myAddress.substring(0,6) + "..." + myAddress.slice(-4)) || "Loading..."}</span>
        <div className="NewConversation HeaderButton" onClick={() => {
          setNewConversationPopup(true);
        }}>New Conversation</div>
        <div className="LookupUser HeaderButton" onClick={() => {
          setLookupPopup(true);
        }}>Lookup User</div>
        <div className="MintNFT HeaderButton" onClick={() => {
          setMintingNFTPopup(true);
        }}>Mint NFT</div>
        <FiSettings className="OpenSettings Icon"
            onClick={() => {
              setActiveLeft(2);
              setSettings(true);
            }}
            style={{
              color: activeLeft === 2 ? "white" : "rgba(255,255,255,0.5)"
            }}/>
      </div>

      <div className="LeftNav">
        <div className="LeftNavHeader">
          <span className="LeftNavHeaderOption">People</span>
        </div>
        {loadedPeople ? (<div>
          {conversations.map((conversation, index) => 
            <div className="Option Person" key={index}
              onClick={() => {
                loadMessageByPerson(conversation);
              }}
            >{conversation.peerAddress.substring(0,6) + "..." + conversation.peerAddress.slice(-4)}</div>
          )}
        </div>) : <div className="Option Person">Loading...</div>}
      </div>
      <div className="MiddleNav">
        <span className="MiddleNavHeaderOption">Sites</span>
        {loadedSites && <div>
          {Object.keys(sites).map((site, index) => 
            <div className="Option Site" key={index}
              onClick={() => {
                displayMessages(site);
              }}
            >{site}</div>
          )}
        </div>}
      </div>

      <div className="RightNav">
        <div className="RightNavHeader">
          <span className="XMTPTitle"><i>Powered by XMTP</i></span>
        </div>
        <div className="Messages">
          {loadedMessages && <div>
            {activeMessages.map((message, index) => 
              <div className={message.includes("Me") ? "Message Right" : "Message Left"} key={index} title={currentWebsite}>{message}</div>
            )}  
          </div>}
        </div>

        {loadedMessages && <input className="TextMessage" type="text" placeholder="Type your message" autoComplete="off"
          onKeyPress={event => {
            if (event.key === "Enter") {
              console.log(event.target.value);
              sendMessage(currentAddress, event.target.value, currentWebsite);
              let newMessage = document.createElement("div");
              newMessage.classList.add("Message");
              newMessage.classList.add("Right");
              newMessage.innerHTML = "Me - " + event.target.value;
              document.getElementsByClassName("Messages")[0].appendChild(newMessage)
              document.getElementsByClassName("TextMessage")[0].value = "";
            }
          }}
        ></input>}
      </div>
    </div>
  );
}
