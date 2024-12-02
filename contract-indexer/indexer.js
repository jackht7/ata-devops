const express = require('express');
const { Registry, Counter, collectDefaultMetrics } = require('prom-client');
const { ethers } = require('ethers');

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const USDT_ADDRESS = process.env.USDT_ADDRESS;
const USDT_ABI = require('./abi.json');
const PORT = 3000;

const app = express();

const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`);
const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);

// Metrics
const register = new Registry();
const txCount = new Counter({
  name: 'usdt_tx_count_total',
  help: 'Total number of transactions',
  labelNames: ['status'], // e.g. success, failure
});

const tokenTransferred = new Counter({
  name: 'usdt_tokens_transferred_total',
  help: 'Total amount of USDT transferred',
  labelNames: ['status'], // e.g. success, failure
});

const tokenTransferredInOneTransaction = new Counter({
  name: 'usdt_tokens_transferred_total_in_one_transaction',
  help: 'Total amount of USDT transferred in one transaction',
  labelNames: ['transactionHash'], // e.g. 0x...
});

register.registerMetric(txCount);
register.registerMetric(tokenTransferred);
register.registerMetric(tokenTransferredInOneTransaction);
collectDefaultMetrics({ register });

usdtContract.on('Transfer', async (from, to, value, event) => {
  const usdt_value = ethers.formatUnits(value, 6); // USDT has 6 decimals
  const transactionHash = event.log.transactionHash;
  const info = {
    from,
    to,
    value: usdt_value,
    transactionHash,
  };
  console.log(info);

  // Increment transaction count and token transferred
  // TODO: Delete tokenTransferredInOneTransaction metric via API, so that it does not accumulate indefinitely with different transactionHash
  txCount.inc({ status: 'success' });
  tokenTransferred.inc({ status: 'success' }, Number(usdt_value));
  tokenTransferredInOneTransaction.inc({ transactionHash: transactionHash }, Number(usdt_value));
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    console.error(err);
    res.status(500).end(err);
  }
});

app.listen(PORT, () => {
  console.log(`Metrics server running on http://localhost:${PORT}/metrics`);
});
