"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  requestTokens,
  getFaucetBalance,
  getRemainingAllowance,
  getTimeUntilNextAutoMint,
  triggerAutoMint,
} from "./contracts/Faucet_Integrate"
import { CircleDollarSign, Droplet, Clock, RefreshCw } from "lucide-react"
import { ethers } from "ethers"

export default function FaucetWithAutoMint() {
  const [faucetBalance, setFaucetBalance] = useState("0")
  const [remainingAllowance, setRemainingAllowance] = useState("0")
  const [amount, setAmount] = useState("")
  const [autoMintStatus, setAutoMintStatus] = useState({
    timeInSeconds: "0",
    formatted: "0 days, 0 hours, 0 minutes",
    isAvailableNow: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = async () => {
    setIsRefreshing(true)
    try {
      const balance = await getFaucetBalance()
      const allowance = await getRemainingAllowance()
      const mintStatus = await getTimeUntilNextAutoMint()
      setFaucetBalance(balance)
      setRemainingAllowance(allowance)
      setAutoMintStatus(mintStatus)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()
          console.log(
            "Connected accounts:",
            accounts.map((a) => a.address),
          )
          const network = await provider.getNetwork()
          console.log("Connected to network:", network.name, network.chainId)
        }
      } catch (err) {
        console.error("Connection check failed:", err)
      }
    }

    checkConnection()
    loadData()
    const interval = setInterval(async () => {
      try {
        const mintStatus = await getTimeUntilNextAutoMint()
        setAutoMintStatus(mintStatus)
      } catch (error) {
        console.error("Failed to update auto-mint status:", error)
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleRequestTokens = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await requestTokens(amount)
      setAmount("")
      await loadData()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Request failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerAutoMint = async () => {
    setLoading(true)
    try {
      await triggerAutoMint()
      await loadData()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Auto-mint trigger failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.6,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.02, 1],
      boxShadow: [
        "0 0 0 0 rgba(42, 143, 240, 0)",
        "0 0 0 10px rgba(42, 143, 240, 0.3)",
        "0 0 0 0 rgba(42, 143, 240, 0)",
      ],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      },
    },
  }

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.97, transition: { duration: 0.1 } },
    loading: {
      scale: 1,
      boxShadow: [
        "0 0 0 0 rgba(42, 143, 240, 0)",
        "0 0 0 10px rgba(42, 143, 240, 0.3)",
        "0 0 0 0 rgba(42, 143, 240, 0)",
      ],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F25] via-[#0E1330] to-[#0A0F25] text-white flex justify-center items-center p-4">
      <motion.div className="relative w-full max-w-lg" initial="hidden" animate="visible" variants={containerVariants}>
        {/* Background decorative elements */}
        <motion.div
          className="absolute top-[-50px] right-[-30px] w-72 h-72 bg-[#2775CA] rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-[-60px] left-[-20px] w-60 h-60 bg-[#2775CA] rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 1,
          }}
        />

        {/* Main card */}
        <motion.div
          className="bg-[#0F1535] p-8 rounded-2xl shadow-2xl border border-[#2775CA]/20 backdrop-blur-sm relative z-10 overflow-hidden"
          variants={itemVariants}
          animate={loading ? "loading" : "idle"}
          variants={pulseVariants}
        >
          {/* USDC Logo and Title */}
          <motion.div className="flex flex-col items-center mb-8" variants={itemVariants}>
            <motion.div
              className="w-20 h-20 bg-[#2775CA] rounded-full flex items-center justify-center mb-4"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <CircleDollarSign size={40} className="text-white" />
            </motion.div>
            <motion.h2
              className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#2775CA] to-[#65a8ff]"
              variants={itemVariants}
            >
              USDC Holesky Faucet
            </motion.h2>
          </motion.div>

          {/* Stats Section */}
          <motion.div className="space-y-4 mb-6" variants={itemVariants}>
            <motion.div
              className="flex justify-between items-center p-3 rounded-xl bg-[#131A3D] border border-[#2775CA]/20"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-gray-400 flex items-center">
                <Droplet className="mr-2 text-[#2775CA]" size={18} />
                Faucet Balance:
              </span>
              <motion.span
                className="font-semibold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={faucetBalance}
              >
                {faucetBalance} USDC
              </motion.span>
            </motion.div>

            <motion.div
              className="flex justify-between items-center p-3 rounded-xl bg-[#131A3D] border border-[#2775CA]/20"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-gray-400 flex items-center">
                <CircleDollarSign className="mr-2 text-[#2775CA]" size={18} />
                Your Allowance:
              </span>
              <motion.span
                className="font-semibold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={remainingAllowance}
              >
                {remainingAllowance} USDC
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Auto-Mint Section */}
          <motion.div
            className="p-5 rounded-xl bg-[#131A3D] border border-[#2775CA]/30 mb-6 relative overflow-hidden"
            variants={itemVariants}
            animate={autoMintStatus.isAvailableNow ? "pulse" : "visible"}
            variants={autoMintStatus.isAvailableNow ? pulseVariants : {}}
          >
            {/* Background decoration for auto-mint */}
            {autoMintStatus.isAvailableNow && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#2775CA]/10 to-[#65a8ff]/10"
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            )}

            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Clock className="mr-2 text-[#2775CA]" size={18} />
              Auto-Mint Status
            </h3>

            <AnimatePresence mode="wait">
              {autoMintStatus.isAvailableNow ? (
                <motion.div
                  key="available"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-green-400 mb-3 flex items-center">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      className="mr-2"
                    >
                      ✅
                    </motion.span>
                    Auto-mint is available now!
                  </p>
                  <motion.button
                    className="bg-[#2775CA] hover:bg-[#3385DB] text-white px-4 py-3 rounded-lg transition w-full flex items-center justify-center font-medium"
                    onClick={handleTriggerAutoMint}
                    disabled={loading}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    animate={loading ? "loading" : "idle"}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="mr-2"
                      >
                        <RefreshCw size={20} />
                      </motion.div>
                    ) : (
                      <Droplet className="mr-2" size={20} />
                    )}
                    {loading ? "Processing..." : "Trigger Auto-Mint (10,000 USDC)"}
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="unavailable"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-300 flex items-center">
                    Next auto-mint in:
                    <motion.span
                      className="font-medium ml-2 text-[#2775CA]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={autoMintStatus.formatted}
                    >
                      {autoMintStatus.formatted}
                    </motion.span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Request Form */}
          <motion.form onSubmit={handleRequestTokens} className="space-y-4" variants={itemVariants}>
            <motion.div variants={itemVariants}>
              <label className="block text-gray-300 mb-2 flex items-center">
                <CircleDollarSign className="mr-2 text-[#2775CA]" size={16} />
                Request USDC (max {remainingAllowance}):
              </label>
              <motion.div className="relative" whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={remainingAllowance}
                  step="0.1"
                  className="w-full px-4 py-3 rounded-lg bg-[#131A3D] text-white border border-[#2775CA]/30 focus:outline-none focus:ring-2 focus:ring-[#2775CA]/50 focus:border-transparent transition-all duration-200"
                  placeholder="Enter amount..."
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">USDC</span>
              </motion.div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading || !amount}
              className={`bg-[#2775CA] text-white px-4 py-3 rounded-lg w-full transition font-medium flex items-center justify-center ${!amount || loading ? "opacity-70" : "hover:bg-[#3385DB]"}`}
              variants={buttonVariants}
              initial="idle"
              whileHover={!loading && amount ? "hover" : "idle"}
              whileTap={!loading && amount ? "tap" : "idle"}
              animate={loading ? "loading" : "idle"}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="mr-2"
                >
                  <RefreshCw size={20} />
                </motion.div>
              ) : (
                <CircleDollarSign className="mr-2" size={20} />
              )}
              {loading ? "Processing..." : "Request USDC"}
            </motion.button>
          </motion.form>

          {/* Refresh button */}
          <motion.button
            onClick={loadData}
            disabled={isRefreshing}
            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#131A3D] p-2 rounded-full"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </motion.button>

          {/* Success notification */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                Transaction successful! ✅
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
