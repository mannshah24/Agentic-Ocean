// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IUniswapV3Router {
    function exactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        address recipient,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint160 sqrtPriceLimitX96
    ) external returns (uint256 amountOut);
}

contract AgenticOceanEscrow {
    struct Escrow {
        address employer;
        address agent;
        address tokenIn;
        address tokenOut;
        uint256 amount;
        bool released;
    }

    mapping(bytes32 => Escrow) public escrows;
    address public keeperHub;
    address public uniswapRouter;

    uint256 private locked = 1;

    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed employer,
        address indexed agent,
        address tokenIn,
        address tokenOut,
        uint256 amount
    );
    event EscrowReleased(bytes32 indexed escrowId, uint256 amountOut, address tokenOut);
    event KeeperHubUpdated(address keeperHub);
    event UniswapRouterUpdated(address uniswapRouter);

    error Unauthorized();
    error EscrowExists();
    error EscrowNotFound();
    error EscrowReleasedAlready();
    error TransferFailed();

    modifier nonReentrant() {
        require(locked == 1, "REENTRANCY");
        locked = 2;
        _;
        locked = 1;
    }

    modifier onlyKeeperHubOrOpen() {
        if (keeperHub != address(0) && msg.sender != keeperHub) {
            revert Unauthorized();
        }
        _;
    }

    constructor(address keeperHub_, address uniswapRouter_) {
        keeperHub = keeperHub_;
        uniswapRouter = uniswapRouter_;
    }

    function setKeeperHub(address keeperHub_) external {
        keeperHub = keeperHub_;
        emit KeeperHubUpdated(keeperHub_);
    }

    function setUniswapRouter(address uniswapRouter_) external {
        uniswapRouter = uniswapRouter_;
        emit UniswapRouterUpdated(uniswapRouter_);
    }

    function createEscrow(
        bytes32 escrowId,
        address agent,
        address tokenIn,
        address tokenOut,
        uint256 amount
    ) external nonReentrant {
        if (escrows[escrowId].employer != address(0)) {
            revert EscrowExists();
        }
        if (!IERC20(tokenIn).transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }

        escrows[escrowId] = Escrow({
            employer: msg.sender,
            agent: agent,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amount: amount,
            released: false
        });

        emit EscrowCreated(escrowId, msg.sender, agent, tokenIn, tokenOut, amount);
    }

    function executeTaskPayout(bytes32 escrowId) external nonReentrant onlyKeeperHubOrOpen {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.employer == address(0)) {
            revert EscrowNotFound();
        }
        if (escrow.released) {
            revert EscrowReleasedAlready();
        }

        escrow.released = true;

        uint256 payoutAmount = escrow.amount;
        address payoutToken = escrow.tokenOut;

        if (escrow.tokenIn != escrow.tokenOut) {
            // Placeholder for Uniswap V3 swap. In production, enforce amountOutMinimum,
            // fee tiers, and slippage protection sourced from off-chain verification.
            IERC20(escrow.tokenIn).approve(uniswapRouter, escrow.amount);

            payoutAmount = IUniswapV3Router(uniswapRouter).exactInputSingle(
                escrow.tokenIn,
                escrow.tokenOut,
                3000,
                address(this),
                escrow.amount,
                0,
                0
            );
        }

        if (!IERC20(payoutToken).transfer(escrow.agent, payoutAmount)) {
            revert TransferFailed();
        }

        emit EscrowReleased(escrowId, payoutAmount, payoutToken);
    }
}
