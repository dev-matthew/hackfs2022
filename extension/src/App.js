import logo from './logo.svg';
import './App.css';
import { Client } from '@xmtp/xmtp-js'  
import { Wallet } from 'ethers'

async function App() {

  
  // You'll want to replace this with a wallet from your application
  const wallet = Wallet.createRandom()

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
