# USDC on Hoodi Testnet with Auto Faucet

Welcome to the USDC deployment on the [Hoodi Testnet] This project features a custom USDC (USD Coin) implementation along with an **Auto Faucet** that automatically mints and distributes tokens to predefined addresses at regular intervals.

## 🚀 Features

- ✅ Custom USDC token deployed on Hoodi Testnet  
- 🔄 Auto Faucet that mints USDC every 10 days  
- 🧪 Ideal for testnet-based DApp development and integration  
- 🔐 ERC-20 compliant  

---

## 📦 Contracts Deployed

| Contract      | Address                                       | Description                                  |
|---------------|-----------------------------------------------|----------------------------------------------|
| USDC Token    | `0x1904f0522FC7f10517175Bd0E546430f1CF0B9Fa`  | ERC-20 USDC token implementation             |
| Auto Faucet   | `0x2F10297555813b8706e9E0eF72fAfAb729516B65`  | Mints and distributes USDC every 10 days     |

---

## ⏱ Auto Faucet Mechanism

- The faucet is programmed to **mint USDC automatically** every 10 days.
- Distribution can be configured to:
  - Specific test addresses
  - Or be claimable through a front-end trigger (if implemented)
- The minting logic is controlled by a timestamp-based interval check, ensuring it only executes after a full 10-day period.

---

## 🧪 Usage

To test this deployment:

1. **Connect to Hoodi Testnet** using your wallet (e.g., MetaMask).
2. Add the USDC token to your wallet manually using the deployed address.
3. If claiming is enabled via front-end or manual trigger, initiate a mint request after 10 days have passed.
4. Alternatively, observe automatic minting behavior via logs/events.

---

## 🛠 Tech Stack

- **Solidity** — Smart contract language  
- **Remix IDE** — Smart contract development environment  
- **Hoodi Testnet** — Blockchain test network  
- **Ether.js V6** — To automate minting  

---

## 📄 License

MIT License  
Feel free to fork and build upon it for your testnet development needs.

---

## 🙌 Acknowledgements

Thanks to the Hoodi Testnet ecosystem for providing a reliable testing environment.

---

## ✍️ Author

Created by **Arijit Roy**  
Feel free to reach out for collaboration or feedback.

