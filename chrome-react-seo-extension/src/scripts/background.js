import {Wallet} from 'ethers';
import {Client} from '@xmtp/xmtp-js';

console.log("Background started");

var passwordProtected;
var password, wallet, xmtp;

async function loadClient() {
    if (localStorage.getItem("privateKey")) {
        if (localStorage.getItem("privateKey").includes("cipher")) {
            passwordProtected = true;
        } else {
            passwordProtected = false;
            await activateClient();
        }
    }
}

async function activateClient() {
    if (passwordProtected) {
        wallet = await Wallet.fromEncryptedJson(localStorage.getItem("privateKey"), password);
    } else {
        wallet = new Wallet(localStorage.getItem("privateKey"));
    }
    xmtp = await Client.create(wallet);
    console.log(xmtp);
}

// eslint-disable-next-line
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.want.includes("password====") && !password) {
        password = request.want.replace("password====", "");
        activateClient();
    }
})

loadClient().then(() => {
    console.log("Attempted to load clent...");
});