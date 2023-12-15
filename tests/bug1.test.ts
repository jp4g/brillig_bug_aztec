import { expect, jest, test, describe, beforeAll } from "@jest/globals";
import {
  AztecAddress,
  Wallet as AztecWallet,
  AccountWallet,
  DebugLogger,
  createDebugLogger,
  createPXEClient,
  getSandboxAccountsWallets,
  CheatCodes,
  PXE,
  TxStatus,
} from "@aztec/aztec.js";
import "dotenv/config";
import { BrilligBugDemo1Contract } from "../src/artifacts/BrilligBugDemo1.js";

const {
  PXE_URL = "http://localhost:8080",
  ETHEREUM_URL = "http://localhost:8545",
} = process.env;

async function deploy(wallet: AztecWallet): Promise<AztecAddress> {
  // deploy contract
  const receipt = await BrilligBugDemo1Contract.deploy(wallet).send().wait();
  // verify tx confirmation
  if (receipt.status !== TxStatus.MINED)
    throw new Error(`Deploy tx status is ${receipt.status}`);
  // return address of deployed contract on l2
  return receipt.contractAddress!;
}

describe("State Channel", () => {
  jest.setTimeout(1500000);
  let pxe: PXE;
  let logger: DebugLogger;
  let accounts: {
    alice: AccountWallet;
    bob: AccountWallet;
  };
  let contractOne: AztecAddress;
  let cc: CheatCodes;

  beforeAll(async () => {
    // initialize logger
    logger = createDebugLogger("statechannel");

    // initialize sandbox connection
    pxe = await createPXEClient(PXE_URL);

    // initialize aztec signers
    const wallets = await getSandboxAccountsWallets(pxe);
    accounts = {
      alice: wallets[0],
      bob: wallets[1],
    };
    // deploy contract
    contractOne = await deploy(accounts.alice);
    // initialize cheat codes
    cc = await CheatCodes.create(ETHEREUM_URL, pxe);
    logger("Initialized Test Environment");
  });

  test("Demonstrate bug with basic private -> private fn call", async () => {
    // get contract instance
    const contract = await BrilligBugDemo1Contract.at(
      contractOne,
      accounts.alice
    );
    // call private -> private fn
    const receipt = await contract.methods.function_one().send().wait();
    // verify tx confirmation
    if (receipt.status !== TxStatus.MINED)
      throw new Error(`Deploy tx status is ${receipt.status}`);
  });
});
