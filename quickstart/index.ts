import { Axiom, AxiomConfig } from '@axiom-crypto/experimental';
import { ReceiptField } from '@axiom-crypto/experimental/experimental/onlyReceiptsQueryBuilder';
import { TransactionField } from '@axiom-crypto/experimental/experimental/txReceiptsQueryBuilder';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URI_GOERLI as string);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

const config: AxiomConfig = {
  providerUri: process.env.PROVIDER_URI_GOERLI || 'http://localhost:8545',
  version: "experimental",
  chainId: 5,
  mock: true,
}
const ax = new Axiom(config);

async function main() {
  let txqb = await newTxQuery();
  console.log("Sending transactions Query transaction...");
  const txRes = await txqb.sendTxReceiptsQuery(wallet, wallet.address, {
    value: ethers.parseEther("0.01"),
    gasPrice: ethers.parseUnits("100", "gwei"),
  });
  console.log(txRes);

  let rqb = await newReceiptQuery();
  console.log("Sending receipt Query transaction...");
  const receiptRes = await rqb.sendOnlyReceiptsQuery(wallet, wallet.address, {
    value: ethers.parseEther("0.01"),
    gasPrice: ethers.parseUnits("100", "gwei"),
  });
  console.log(receiptRes);
}

async function newTxQuery() {
  const qb = ax.experimental.newTxReceiptsQueryBuilder();
  await qb.appendTxQuery({
    txHash:
      "0x9ba6df3200fe8d62103ede64a32a2475e4c7f992fe5e8ea7f08a490edf32d48d",
    field: TransactionField.To,
  });
  await qb.appendTxQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: TransactionField.Data,
  });
  await qb.appendReceiptQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: ReceiptField.Status,
  });
  await qb.appendReceiptQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: ReceiptField.CumulativeGas,
  });
  await qb.appendReceiptQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: ReceiptField.Logs,
    logIndex: 0,
  });

  return qb;
}

async function newReceiptQuery() {
  const qb = ax.experimental.newOnlyReceiptsQueryBuilder();
  await qb.appendReceiptQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: ReceiptField.Status,
  });
  await qb.appendReceiptQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: ReceiptField.Logs,
    logIndex: 0,
  });
  await qb.appendReceiptQuery({
    txHash:
      "0x1320047d683efdf132b7939418a9f0061f9dfd7348a2f347f32745fb46cb6ec6",
    field: ReceiptField.CumulativeGas,
  });
  return qb;
}

main();