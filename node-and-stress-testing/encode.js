const fs = require('fs');
const { ethers } = require('ethers');

const abi = ['function mint(address to, uint256 amount) public'];

const contractAddress = process.env.CONTRACT_ADDRESS;
const recipientAddress = process.env.RECIPIENT_ADDRESS;
const mintAmount = ethers.parseUnits('1', 18); // Minting 1 token (18 decimals)

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const contract = new ethers.Contract(contractAddress, abi, provider);

const encodedData = contract.interface.encodeFunctionData('mint', [recipientAddress, mintAmount]);

fs.writeFileSync('encodedData.txt', encodedData);

console.log('Encoded Data written to encodedData.txt');
