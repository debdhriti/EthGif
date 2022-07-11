// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

// import "hardhat/console.sol";

contract Transactions {
    uint256 transactionCount;

    //properties of the object
    event Transfer(
        address from,
        address receiver,
        uint256 amount,
        string message,
        uint256 timestamp,
        string keyword
    );

    //properties of the object
    struct TransferStruct {
        address sender;
        address receiver;
        uint256 amount;
        string message;
        uint256 timestamp;
        string keyword;
    }
    //all different transactions are stored here
    TransferStruct[] transactions;

    function addToBlockchain(
        address payable receiver,
        uint256 amount,
        string memory message,
        string memory keyword //memory keyword---> data stored into memory of that transaction
    ) public {
        //access modifier of the function
        transactionCount += 1;
        transactions.push(
            TransferStruct(
                msg.sender, //msg.sender always included throughout blockchain
                receiver,
                amount,
                message,
                block.timestamp,
                keyword
            )
        );

        emit Transfer( //responsible for the actual tranasfer
            msg.sender,
            receiver,
            amount,
            message,
            block.timestamp,
            keyword
        );
    }

    function getAllTransactions()
        public
        view
        returns (TransferStruct[] memory)
    {
        //returns all transactions
        return transactions;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }
}
