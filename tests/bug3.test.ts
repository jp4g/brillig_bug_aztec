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
import { CounterStateChannelContract } from "../src/artifacts/CounterStateChannel.js";

const {
  PXE_URL = "http://localhost:8080",
  ETHEREUM_URL = "http://localhost:8545",
} = process.env;

async function deploy(wallet: AztecWallet): Promise<AztecAddress> {
  // deploy contract
  const receipt = await CounterStateChannelContract.deploy(wallet)
    .send()
    .wait();
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
    // initialize the counter
    const contract = await CounterStateChannelContract.at(
      contractAddress,
      accounts.alice
    );
    const receipt = await contract.methods.init_counter(0, 3).send().wait();
    // verify tx confirmation
    if (receipt.status !== TxStatus.MINED)
      throw new Error(`init_counter tx status is ${receipt.status}`);

    logger("Initialized Test Environment");
  });

  test("Demonstrate bug with basic private -> private fn call", async () => {
    // get contract instance
    const contract = await CounterStateChannelContract.at(
      contractAddress,
      accounts.alice
    );
    // call private -> private fn
    const receipt = await contract.methods.function_one().send().wait();
    // verify tx confirmation
    if (receipt.status !== TxStatus.MINED)
      throw new Error(`Deploy tx status is ${receipt.status}`);
  });

  test("Demonstrate bug with increment_multiple", async () => {
    // get contract instance
    const contract = await CounterStateChannelContract.at(
      contractAddress,
      accounts.alice
    );
    // get count before
    const address = accounts.alice.getCompleteAddress().address;
    let count = await contract.methods.get_counter(address).view();
    expect(count).toEqual(0n);
    // increment to end
    const receipt = await contract.methods.increment_multiple().send().wait();
    // verify tx confirmation
    if (receipt.status !== TxStatus.MINED)
      throw new Error(`Deploy tx status is ${receipt.status}`);
    // get count after
    count = await contract.methods.get_counter(address).view();
    expect(count).toEqual(3n);
  });
});
