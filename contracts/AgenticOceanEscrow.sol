// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal interface for Uniswap V3 Router
interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract AgenticOceanEscrow {
    address public owner;
    address public keeperHubForwarder; // The address KeeperHub uses to trigger transactions
    ISwapRouter public immutable swapRouter;

    struct Job {
        address employer;
        address serviceAgentWallet;
        address tokenIn; // e.g., USDC
        uint256 amount;
        uint256 collateralRequired;
        uint256 collateralStaked;
        bool isCompleted;
    }

    mapping(uint256 => Job) public jobs;
    uint256 public nextJobId = 1;

    event JobCreated(
        uint256 indexed jobId,
        address indexed employer,
        address indexed serviceAgent,
        address tokenIn,
        uint256 amount,
        uint256 collateralRequired
    );
    event CollateralStaked(uint256 indexed jobId, address indexed agent, uint256 amount);
    event JobFinalized(uint256 indexed jobId, bool success, address tokenOut, uint256 amountOut);

    constructor(address _swapRouter, address _keeperHubForwarder) {
        owner = msg.sender;
        swapRouter = ISwapRouter(_swapRouter);
        keeperHubForwarder = _keeperHubForwarder;
    }

    /// @notice Employer locks funds to hire an Agent and defines collateral requirements
    function hireAgent(
        address _agentWallet,
        address _tokenIn,
        uint256 _amount,
        uint256 _collateralRequired
    ) external returns (uint256) {
        require(IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        uint256 jobId = nextJobId++;
        jobs[jobId] = Job({
            employer: msg.sender,
            serviceAgentWallet: _agentWallet,
            tokenIn: _tokenIn,
            amount: _amount,
            collateralRequired: _collateralRequired,
            collateralStaked: 0,
            isCompleted: false
        });
        emit JobCreated(jobId, msg.sender, _agentWallet, _tokenIn, _amount, _collateralRequired);
        return jobId;
    }

    /// @notice Agent stakes collateral to back their reputation for this job
    function stakeCollateral(uint256 _jobId, uint256 _amount) external {
        Job storage job = jobs[_jobId];
        require(job.amount > 0, "Invalid job");
        require(!job.isCompleted, "Job already completed");
        require(msg.sender == job.serviceAgentWallet, "Only agent can stake");
        require(_amount >= job.collateralRequired, "Insufficient collateral");

        require(IERC20(job.tokenIn).transferFrom(msg.sender, address(this), _amount), "Collateral transfer failed");
        job.collateralStaked = _amount;
        emit CollateralStaked(_jobId, msg.sender, _amount);
    }

    /// @notice KeeperHub calls this once off-chain work is verified via 0G/Gensyn
    /// @dev Swaps the locked tokenIn to tokenOut (e.g., WETH), pays the agent, and resolves collateral
    function finalizeJob(uint256 _jobId, address _tokenOut, uint24 _poolFee, bool _success) external {
        // Ensure ONLY KeeperHub (or owner for testing) can trigger payouts
        require(msg.sender == keeperHubForwarder || msg.sender == owner, "Unauthorized Execution");

        Job storage job = jobs[_jobId];
        require(!job.isCompleted, "Job already completed");
        require(job.amount > 0, "Invalid job");
        require(job.collateralStaked >= job.collateralRequired, "Collateral not staked");

        job.isCompleted = true;

        if (_success) {
            // 1. Approve Uniswap Router to spend the locked tokens
            IERC20(job.tokenIn).approve(address(swapRouter), job.amount);

            // 2. Execute Swap on Uniswap V3
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: job.tokenIn,
                tokenOut: _tokenOut,
                fee: _poolFee,
                recipient: job.serviceAgentWallet,
                deadline: block.timestamp + 15 minutes,
                amountIn: job.amount,
                amountOutMinimum: 0, // In production, calculate slippage. Set to 0 for hackathon demo.
                sqrtPriceLimitX96: 0
            });

            // The Uniswap router automatically sends the _tokenOut to the Agent's wallet
            uint256 amountOut = swapRouter.exactInputSingle(params);

            // Return collateral to the agent
            IERC20(job.tokenIn).transfer(job.serviceAgentWallet, job.collateralStaked);
            emit JobFinalized(_jobId, true, _tokenOut, amountOut);
        } else {
            // Refund employer payment and slash collateral to employer
            IERC20(job.tokenIn).transfer(job.employer, job.amount + job.collateralStaked);
            emit JobFinalized(_jobId, false, _tokenOut, 0);
        }
    }
}