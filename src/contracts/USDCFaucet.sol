// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./USDC.sol";

contract USDCAutoFaucet {
    CustomERC20 public usdcToken;
    address public owner;

    uint256 public maxTokensPerDay = 2000 * 10 ** 6; // 100 USDC (with 6 decimals)
    uint256 public constant COOLDOWN_TIME = 1 days;
    uint256 public constant AUTO_MINT_INTERVAL = 10 days;
    uint256 public constant AUTO_MINT_AMOUNT = 1000000 * 10 ** 6; // 10,000 USDC

    uint256 public lastAutoMintTime;

    mapping(address => uint256) public lastAccessTime;
    mapping(address => uint256) public tokensReceived;

    event TokensDispensed(address indexed recipient, uint256 amount);
    event AutoMintExecuted(uint256 amount, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _tokenAddress) {
        usdcToken = CustomERC20(_tokenAddress);
        owner = msg.sender;
        lastAutoMintTime = block.timestamp;
    }

    function requestTokens(uint256 amount) external {
        require(
            amount <= maxTokensPerDay,
            "Requested amount exceeds daily limit"
        );

        // Check if 24 hours have passed since last request
        if (block.timestamp >= lastAccessTime[msg.sender] + COOLDOWN_TIME) {
            // Reset tokens received if 24 hours passed
            tokensReceived[msg.sender] = 0;
        }

        // Check if user is within daily limit
        require(
            tokensReceived[msg.sender] + amount <= maxTokensPerDay,
            "Daily limit exceeded"
        );

        // Update user's record
        lastAccessTime[msg.sender] = block.timestamp;
        tokensReceived[msg.sender] += amount;

        // Try auto-mint if enough time has passed
        tryAutoMint();

        // Transfer tokens to the user
        require(
            usdcToken.transfer(msg.sender, amount),
            "Token transfer failed"
        );

        emit TokensDispensed(msg.sender, amount);
    }

    // Function that can be called by anyone to trigger the auto-mint if enough time has passed
    function tryAutoMint() public {
        if (block.timestamp >= lastAutoMintTime + AUTO_MINT_INTERVAL) {
            // Mint 10,000 USDC to the faucet
            usdcToken.mint(address(this), AUTO_MINT_AMOUNT);

            // Update last auto-mint time
            lastAutoMintTime = block.timestamp;

            emit AutoMintExecuted(AUTO_MINT_AMOUNT, block.timestamp);
        }
    }

    // Function to force auto-mint regardless of time (owner only)
    function forceAutoMint() external onlyOwner {
        usdcToken.mint(address(this), AUTO_MINT_AMOUNT);
        lastAutoMintTime = block.timestamp;
        emit AutoMintExecuted(AUTO_MINT_AMOUNT, block.timestamp);
    }

    // Function to withdraw tokens from the faucet (owner only)
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(usdcToken.transfer(owner, amount), "Token transfer failed");
    }

    // Function to update the max tokens per day (owner only)
    function setMaxTokensPerDay(uint256 _maxTokensPerDay) external onlyOwner {
        maxTokensPerDay = _maxTokensPerDay;
    }

    // Function to get faucet balance
    function getFaucetBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    // Function to check how many tokens user can still request today
    function getRemainingAllowance(
        address user
    ) external view returns (uint256) {
        if (block.timestamp >= lastAccessTime[user] + COOLDOWN_TIME) {
            return maxTokensPerDay;
        }

        if (tokensReceived[user] >= maxTokensPerDay) {
            return 0;
        }

        return maxTokensPerDay - tokensReceived[user];
    }

    // Function to check time until next auto-mint
    function timeUntilNextAutoMint() external view returns (uint256) {
        uint256 nextMintTime = lastAutoMintTime + AUTO_MINT_INTERVAL;

        if (block.timestamp >= nextMintTime) {
            return 0;
        }

        return nextMintTime - block.timestamp;
    }
}
