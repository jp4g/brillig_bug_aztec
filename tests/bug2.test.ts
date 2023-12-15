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
import { CounterContract } from "../src/artifacts/Counter.js";

const {
  PXE_URL = "http://localhost:8080",
  ETHEREUM_URL = "http://localhost:8545",
} = process.env;

async function deploy(wallet: AztecWallet): Promise<AztecAddress> {
  // deploy contract
  const address = wallet.getCompleteAddress().address;
  const receipt = await CounterContract.deploy(wallet, 0, address).send().wait();
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
  let contractAddress: AztecAddress;
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
    contractAddress = await deploy(accounts.alice);
    // initialize cheat codes
    cc = await CheatCodes.create(ETHEREUM_URL, pxe);
    logger("Initialized Test Environment");
  });

  test("Demonstrate bug with basic private -> private fn call", async () => {
    // get contract instance
    const contract = await CounterContract.at(
      contractAddress,
      accounts.alice
    );
    // get count before
    const address = accounts.alice.getCompleteAddress().address;
    let count = await contract.methods.get_counter(address).view();
    expect(count).toEqual(0n);
    // call private -> private fn
    const receipt = await contract.methods.increment_twice(address).send().wait();
    // verify tx confirmation
    if (receipt.status !== TxStatus.MINED)
      throw new Error(`Deploy tx status is ${receipt.status}`);
    // get count after
    count = await contract.methods.get_counter(address).view();
    expect(count).toEqual(2n);
  });
});
