import http from 'k6/http';
import { check, sleep } from 'k6';
import { readFileSync } from 'fs';

export const options = {
  stages: [
    { duration: '1m', target: 200 }, // traffic ramp-up from 1 to a higher 200 users over 1 minute.
    { duration: '3m', target: 200 }, // stay at higher 200 users for 3 minutes
    { duration: '5m', target: 0 }, // ramp-down to 0 users
  ],
};

const rpcUrl = 'http://localhost:8545';
const encodedData = readFileSync('encodedData.txt', 'utf8');
const mintTransaction = {
  jsonrpc: '2.0',
  method: 'eth_sendTransaction',
  params: [
    {
      from: process.env.RECIPIENT_ADDRESS,
      to: process.env.CONTRACT_ADDRESS,
      data: encodedData,
    },
  ],
  id: 1,
};

export default function () {
  let response = http.post(rpcUrl, JSON.stringify(mintTransaction), { headers: { 'Content-Type': 'application/json' } });

  check(response, {
    'is status 200': (r) => r.status === 200,
    'has transaction hash': (r) => r.body.includes('0x'),
  });

  sleep(1);
}
