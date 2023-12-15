# Brillig issue
Trying to reproduce [Brillig Issue](https://github.com/AztecProtocol/aztec-packages/issues/3689) but it actually works...

# Installation
1. `git clone https://github.com/jp4g/brillig_bug_aztec.git && cd brillig_bug_aztec`
2. `yarn`
3. `yarn sandbox`
OPEN NEW TERMINAL IN SAME DIRECTORY
4. `yarn artifacts`
5. `yarn test`

bug1 contract: absolute most basic private -> private function call possible
bug2 contract: counter contract (slightly modified)