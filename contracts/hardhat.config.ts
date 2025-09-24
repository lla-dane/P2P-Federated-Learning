import type { HardhatUserConfig } from "hardhat/config";

import "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28"
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    }
  },
  networks: {
    testnet: {
      type: "http",
      url: configVariable("HEDERA_RPC_URL"),
      accounts: [configVariable("HEDERA_PRIVATE_KEY")]
    }
  }
};

export default config;