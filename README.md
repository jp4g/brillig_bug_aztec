# Brillig issue
Reproduce [Brillig Issue](https://github.com/AztecProtocol/aztec-packages/issues/3689)

## Installation
1. `git clone https://github.com/jp4g/brillig_bug_aztec.git && cd brillig_bug_aztec`
2. `yarn`
3. `yarn sandbox`
4. OPEN NEW TERMINAL IN SAME DIRECTORY, then `yarn artifacts`

## Cases

To reproduce the bug, run `yarn test tests/bug3.test.ts`. See bug 3 section below for more information

### Bug 1
Absolute most basic private -> private function call. Works (Not a real bug)

### Bug 2
The original counter contract that the state channel counter contract was based on. Modified slightly (AztecAddress import was not working + add private -> private function call). Works (Not a real bug)

## Bug 3
This contract is being used as the most basic case for a "state channel" built by abusing the kernel prover. Essentially, instead of creating many kernel proofs for one transaction, channel counterparty alice will produce a private kernel proofs that enques another call of the same function. They will pass this kernel proof to bob who will produce another iteration of the kernel proof, using the capsule oracle to provide their own data (since function calldata is set in previous turn). The counter state channel is a MVP which would allow us to create each iteration of the kernel proof manually.

Trying to produce the transaction will encounter the [Brillig Issue](https://github.com/AztecProtocol/aztec-packages/issues/3689). It is also encountered when running the first iteration of the kernel proof from a fork of the PXE. Current suspicion is that the CounterNote implementation or the contract-level nullifier hash is broken.
