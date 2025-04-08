import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  requestTokens,
  getFaucetBalance,
  getRemainingAllowance,
  getTimeUntilNextAutoMint,
  triggerAutoMint
} from './contracts/Faucet_Integrate';

function FaucetWithAutoMint() {
  const [faucetBalance, setFaucetBalance] = useState('0');
  const [remainingAllowance, setRemainingAllowance] = useState('0');
  const [amount, setAmount] = useState('');
  const [autoMintStatus, setAutoMintStatus] = useState({
    timeInSeconds: '0',
    formatted: '0 days, 0 hours, 0 minutes',
    isAvailableNow: false
  });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const balance = await getFaucetBalance();
      const allowance = await getRemainingAllowance();
      const mintStatus = await getTimeUntilNextAutoMint();
      setFaucetBalance(balance);
      setRemainingAllowance(allowance);
      setAutoMintStatus(mintStatus);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  useEffect(() => {

    const checkConnection = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          console.log("Connected accounts:", accounts.map(a => a.address));
          const network = await provider.getNetwork();
          console.log("Connected to network:", network.name, network.chainId);
        }
      } catch (err) {
        console.error("Connection check failed:", err);
      }
    };
    
    checkConnection();
    loadData();
    const interval = setInterval(async () => {
      try {
        const mintStatus = await getTimeUntilNextAutoMint();
        setAutoMintStatus(mintStatus);
      } catch (error) {
        console.error("Failed to update auto-mint status:", error);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestTokens(amount);
      setAmount('');
      await loadData();
    } catch (error) {
      console.error("Request failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAutoMint = async () => {
    setLoading(true);
    try {
      await triggerAutoMint();
      await loadData();
    } catch (error) {
      console.error("Auto-mint trigger failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">USDC</h2>
        <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">Auto-Faucet</h2>

        <div className="space-y-4 mb-6">
          <p><span className="text-gray-400">Faucet Balance:</span> <span className="font-semibold">{faucetBalance} USDC</span></p>
          <p><span className="text-gray-400">Your Remaining Allowance:</span> <span className="font-semibold">{remainingAllowance} USDC</span></p>
        </div>

        <motion.div
          className="p-4 rounded-xl bg-gray-800 border border-cyan-700 mb-6"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <h3 className="text-lg font-semibold mb-2">Auto-Mint Status</h3>
          {autoMintStatus.isAvailableNow ? (
            <>
              <p className="text-green-400 mb-2">✅ Auto-mint is available now!</p>
              <button
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition duration-200 w-full"
                onClick={handleTriggerAutoMint}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Trigger Auto-Mint (10,000 USDC)'}
              </button>
            </>
          ) : (
            <p className="text-gray-300">Next auto-mint available in: <span className="font-medium">{autoMintStatus.formatted}</span></p>
          )}
        </motion.div>

        <form onSubmit={handleRequestTokens} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Request USDC (max {remainingAllowance}):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={remainingAllowance}
              step="0.1"
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg w-full transition duration-200"
          >
            {loading ? 'Processing...' : 'Request USDC'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default FaucetWithAutoMint;
