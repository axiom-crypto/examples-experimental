import { Axiom, AxiomConfig } from '@axiom-crypto/experimental';
import { ReceiptField } from '@axiom-crypto/experimental/experimental/onlyReceiptsQueryBuilder';
import { TransactionField } from '@axiom-crypto/experimental/experimental/txReceiptsQueryBuilder';
import { ethers } from 'ethers';
import axiomV1QueryExperimentalAbi from './abi/AxiomExperimentalTxMock.json';
import dotenv from 'dotenv';
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URI_GOERLI as string);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
const axiomV1QueryExperimental = new ethers.Contract("0xCa057924353E372d7c46F194ed0d75eABA7f1ed1", axiomV1QueryExperimentalAbi.abi, wallet);

const config: AxiomConfig = {
  providerUri: process.env.PROVIDER_URI_GOERLI || 'http://localhost:8545',
  version: "experimental",
  chainId: 5,
  mock: true,
}
const ax = new Axiom(config);

async function main() {
  // Create a new Tx/Receipts Query
  let txqb = await newTxQuery();

  // Send the Tx/Receipts query to experimental AxiomV1Query contract
  console.log("Sending Tx/Receipts Query transaction...");
  const txRes = await txqb.sendTxReceiptsQuery(wallet, wallet.address, {
    value: ethers.parseEther("0.01"),
    gasPrice: ethers.parseUnits("100", "gwei"),
  });
  console.log(txRes);

  // Listen for the response
  axiomV1QueryExperimental.on("QueryFulfilled", fulfilledHandler);
}

// IMPORTANT: Each Query is hashed and used as a key in our AxiomV1Query contract, which means that 
//            you MUST change the Query data in some way when submitting a a Query to the contract 
//            or the transaction will fail.
async function newTxQuery() {
  const qb = ax.experimental.newTxReceiptsQueryBuilder();
  await qb.appendTxQuery({
    txHash: "0x97f7f3354930dfd577f84b0db7022e14e8dbcf6c48fef7c84faa0ed8d22c9415",
    field: TransactionField.To,
  });
  await qb.appendTxQuery({
    txHash: "0x5a295694f62adf27f617e1d8d2e0e74e8f6c2464b7b7d86fadd2ac7548e8dede",
    field: TransactionField.Data,
  });
  // await qb.appendReceiptQuery({
  //   txHash: "0x5a295694f62adf27f617e1d8d2e0e74e8f6c2464b7b7d86fadd2ac7548e8dede",
  //   field: ReceiptField.Status,
  // });
  await qb.appendReceiptQuery({
    txHash: "0x5a295694f62adf27f617e1d8d2e0e74e8f6c2464b7b7d86fadd2ac7548e8dede",
    field: ReceiptField.CumulativeGas,
  });
  await qb.appendReceiptQuery({
    txHash: "0x5a295694f62adf27f617e1d8d2e0e74e8f6c2464b7b7d86fadd2ac7548e8dede",
    field: ReceiptField.Logs,
    logIndex: 0,
  });

  return qb;
}

async function fulfilledHandler(queryType: number, keccakQueryResponse: string, payment: string, prover: string) {
  console.log("QueryFulfilled", queryType, keccakQueryResponse, payment, prover);

  const txqb = await newTxQuery();
  const responseTree = await txqb.getResponseTrees();

  // Get tx/Receipt response & data
  const keccakTxResponse = responseTree.tx.tree.getHexRoot();
  const keccakReceiptResponse = responseTree.receipt.tree.getHexRoot();
  const txData = responseTree.tx.data;
  const receiptData = responseTree.receipt.data;
  responseTree.tx.data

  console.log("keccakTxResponse", keccakTxResponse);
  console.log("keccakReceiptResponse", keccakReceiptResponse);
  console.log("txData", txData);
  console.log("receiptData", receiptData);

  // Send data to your smart contract to complete some action:
  // yourSmartContract.claimTokens(numTokens, keccakTxResponse, keccakReceiptResponse, txData, receiptData);
}

main();