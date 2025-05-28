import { ethers } from "ethers";

// Make sure this is the correct address of your deployed USDCAutoFaucet contract
const FAUCET_ADDRESS = "0x12CE5cA399e3FF934c17A48117aeeb80D22d601C";

// Correctly match the ABI to your USDCAutoFaucet contract
const FAUCET_ABI = [
  // User functions
  "function requestTokens(uint256 amount) external",
  "function getRemainingAllowance(address user) external view returns (uint256)",
  "function getFaucetBalance() external view returns (uint256)",
  
  // Auto-mint functions
  "function tryAutoMint() public",
  "function timeUntilNextAutoMint() external view returns (uint256)",
  "function lastAutoMintTime() external view returns (uint256)",
  
  // Owner functions
  "function forceAutoMint() external",
  "function withdrawTokens(uint256 amount) external",
  "function setMaxTokensPerDay(uint256 _maxTokensPerDay) external",
  
  // Public variables
  "function usdcToken() external view returns (address)",
  "function owner() external view returns (address)",
  "function maxTokensPerDay() external view returns (uint256)"
];

async function getFaucetContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected");
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    if (!FAUCET_ADDRESS) {
      throw new Error("Faucet contract address is undefined");
    }
    
    return new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);
  } catch (error) {
    console.error("Failed to get faucet contract:", error);
    throw error;
  }
}

// Request tokens from the faucet
async function requestTokens(amount) {
  if (!amount) throw new Error("Amount is required");
  
  try {
    const contract = await getFaucetContract();
    console.log(`Requesting ${amount} USDC from faucet`);
    const amountInWei = ethers.parseEther(amount.toString());
    
    const tx = await contract.requestTokens(amountInWei);
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    
    console.log("Successfully received tokens from faucet");
    return tx;
  } catch (error) {
    console.error("Faucet request failed:", error);
    throw error;
  }
}

// Get remaining tokens allowance for the day
async function getRemainingAllowance() {
  try {
    const contract = await getFaucetContract();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];
    
    console.log("Getting allowance for:", userAddress);
    const remainingWei = await contract.getRemainingAllowance(userAddress);
    const formatted = ethers.formatEther(remainingWei);
    console.log("Remaining allowance:", formatted);
    return formatted;
  } catch (error) {
    console.error("Failed to get remaining allowance:", error);
    throw error;
  }
}

// Get faucet balance with debugging
async function getFaucetBalance() {
  try {
    console.log("Getting faucet balance...");
    const contract = await getFaucetContract();
    
    console.log("Connected to contract at:", FAUCET_ADDRESS);
    const balanceWei = await contract.getFaucetBalance();
    
    console.log("Raw balance (BigInt):", balanceWei.toString());
    const formattedBalance = ethers.formatEther(balanceWei);
    console.log("Formatted balance:", formattedBalance);
    
    return formattedBalance;
  } catch (error) {
    console.error("Failed to get faucet balance:", error);
    console.error("Error details:", error);
    return "0"; // Return 0 on error for graceful degradation
  }
}

// Trigger the auto-mint check
async function triggerAutoMint() {
  try {
    const contract = await getFaucetContract();
    console.log("Triggering auto-mint check...");
    
    const tx = await contract.tryAutoMint();
    console.log("Auto-mint transaction sent:", tx.hash);
    await tx.wait();
    
    console.log("Auto-mint check completed");
    return tx;
  } catch (error) {
    console.error("Auto-mint trigger failed:", error);
    throw error;
  }
}

// Force auto-mint (owner only)
async function forceAutoMint() {
  try {
    const contract = await getFaucetContract();
    console.log("Forcing auto-mint...");
    
    const tx = await contract.forceAutoMint();
    console.log("Force auto-mint transaction sent:", tx.hash);
    await tx.wait();
    
    console.log("Force auto-mint completed");
    return tx;
  } catch (error) {
    console.error("Force auto-mint failed:", error);
    throw error;
  }
}

// Get time until next auto-mint
// Get time until next auto-mint
async function getTimeUntilNextAutoMint() {
  try {
    const contract = await getFaucetContract();
    console.log("Checking time until next auto-mint...");
    
    const timeInSeconds = await contract.timeUntilNextAutoMint();
    console.log("Time until next auto-mint (seconds):", timeInSeconds.toString());
    
    // Convert BigInt to Number for calculations
    const timeInSecondsNumber = Number(timeInSeconds);
    
    // Convert to days, hours, minutes format
    const days = Math.floor(timeInSecondsNumber / 86400);
    const hours = Math.floor((timeInSecondsNumber % 86400) / 3600);
    const minutes = Math.floor((timeInSecondsNumber % 3600) / 60);
    
    const formatted = `${days} days, ${hours} hours, ${minutes} minutes`;
    console.log("Formatted time:", formatted);
    
    return {
      timeInSeconds: timeInSeconds.toString(),
      formatted: formatted,
      isAvailableNow: timeInSeconds.toString() === "0"
    };
  } catch (error) {
    console.error("Failed to get time until next auto-mint:", error);
    return {
      timeInSeconds: "0",
      formatted: "Error",
      isAvailableNow: false
    };
  }
}

export { 
  requestTokens, 
  getRemainingAllowance, 
  getFaucetBalance,
  triggerAutoMint,
  forceAutoMint,
  getTimeUntilNextAutoMint
};