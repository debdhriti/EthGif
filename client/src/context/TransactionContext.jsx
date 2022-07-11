//CONTEXT PASSED ON TO main.jsx

import React, { useEffect, useState } from "react";
//ethers--> npm package with Ethereum wallet implementation and utilities
import { ethers } from "ethers";

//contractABI---> interface between two program modules
import { contractABI, contractAddress } from "../utils/constants";
import { AiOutlineConsoleSql } from "react-icons/ai";

export const TransactionContext = React.createContext();

//destructuring from window.ethereum object(accessible from console)
const { ethereum } = window;

//fetch the ethereum contract
const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  //3 arguments-->needed to fetch the ethereum contracts
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
  // console.log({ provider, signer, transactionsContract });
  return transactionsContract;
};

//every contact provider needs children object from the props
export const TransactionsProvider = ({ children }) => {
  //for fetching form data
  const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount")); //so that it doesnt update everytime browser is reloaded
  const [transactions, setTransactions] = useState([]);

  //dynamically updates the state responsible for form
  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();
        //the inside function comes from Transactions.sol under smart_contracts
        const availableTransactions = await transactionsContract.getAllTransactions();

        const structuredTransactions = availableTransactions.map((transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(), //date format
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / (10 ** 18) //wei to eth conversion
        }));

        console.log(structuredTransactions);

        setTransactions(structuredTransactions);
      } else {
        alert("Ethereum is not present!!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const checkIfWalletIsConnect = async () => {
    try {
      //if no ethereum => metamask is to be installed
      if (!ethereum) return alert("Please install MetaMask.");
      //gets the account connected to metamask
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfTransactionsExists = async () => {
    try {
        const transactionsContract = createEthereumContract();
        const currentTransactionCount = await transactionsContract.getTransactionCount();
         //stores the transaction count
        window.localStorage.setItem("transactionCount", currentTransactionCount);
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

//listens to the "Connect" button in ui(Shows only when not connected)
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      //gets all the requestAccounts
      const accounts = await ethereum.request({ method: "eth_requestAccounts", });
      //current account--> 1st available
      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  const sendTransaction = async () => {
    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        //get info from form and create contract
        const transactionsContract = createEthereumContract();
        //parse the amount from form as gwei hexadecimal
        const parsedAmount = ethers.utils.parseEther(amount);

        await ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: currentAccount, //state of current account
            to: addressTo,
            gas: "0x5208", //amount of gas in hex(21,000 wei in decimal)
            value: parsedAmount._hex, //hex gwei
          }],
        });
        
        //adds the message to blockchain
        //and gets the unique hash for transaction
        const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        //after promise resolution loading has to terminate
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);
        const transactionsCount = await transactionsContract.getTransactionCount();

        setTransactionCount(transactionsCount.toNumber()); //stored as a state
        window.location.reload();
      } else {
        console.log("Please install metamask");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  //useEffect--> side effects n function components
  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionCount]);

  //wrapped in context of provider
  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
