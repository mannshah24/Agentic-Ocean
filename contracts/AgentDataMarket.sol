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

error Unauthorized();
error InvalidListing();
error InvalidPurchase();
error AlreadyExecuted();
error TransferFailed();

contract AgentDataMarket {
    address public owner;
    address public keeperHubForwarder;
    ISwapRouter public immutable swapRouter;

    struct DataListing {
        address sellerWallet;
        bytes32 ogStorageHash;
        uint256 price;
        address tokenIn;
    }

    struct Purchase {
        uint256 listingId;
        address buyer;
        address tokenOut;
        bool executed;
    }

    mapping(uint256 => DataListing) public listings;
    mapping(uint256 => Purchase) public purchases;
    uint256 public nextListingId = 1;
    uint256 public nextPurchaseId = 1;

    uint256 private locked = 1;

    event ListingCreated(uint256 indexed listingId, address indexed seller, bytes32 ogStorageHash, address tokenIn, uint256 price);
    event DataPurchased(uint256 indexed purchaseId, uint256 indexed listingId, address indexed buyer, address tokenOut, uint256 price);
    event PurchaseExecuted(uint256 indexed purchaseId, uint256 indexed listingId, address indexed seller, address tokenOut, uint256 amountOut);

    modifier nonReentrant() {
        require(locked == 1, "Reentrancy");
        locked = 2;
        _;
        locked = 1;
    }

    modifier onlyKeeperHub() {
        if (msg.sender != keeperHubForwarder && msg.sender != owner) {
            revert Unauthorized();
        }
        _;
    }

    constructor(address _swapRouter, address _keeperHubForwarder) {
        owner = msg.sender;
        swapRouter = ISwapRouter(_swapRouter);
        keeperHubForwarder = _keeperHubForwarder;
    }

    function createListing(bytes32 _ogStorageHash, uint256 _price, address _tokenIn) external returns (uint256) {
        uint256 listingId = nextListingId++;
        listings[listingId] = DataListing({
            sellerWallet: msg.sender,
            ogStorageHash: _ogStorageHash,
            price: _price,
            tokenIn: _tokenIn
        });

        emit ListingCreated(listingId, msg.sender, _ogStorageHash, _tokenIn, _price);
        return listingId;
    }

    /// @notice Buyer locks funds for a listing in the listing's tokenIn
    function purchaseData(uint256 listingId, address tokenOut) external nonReentrant returns (uint256) {
        DataListing storage listing = listings[listingId];
        if (listing.sellerWallet == address(0)) {
            revert InvalidListing();
        }

        if (!IERC20(listing.tokenIn).transferFrom(msg.sender, address(this), listing.price)) {
            revert TransferFailed();
        }

        uint256 purchaseId = nextPurchaseId++;
        purchases[purchaseId] = Purchase({
            listingId: listingId,
            buyer: msg.sender,
            tokenOut: tokenOut,
            executed: false
        });

        emit DataPurchased(purchaseId, listingId, msg.sender, tokenOut, listing.price);
        return purchaseId;
    }

    /// @notice KeeperHub calls this once it verifies the decryption key was delivered via Gensyn AXL
    /// @dev Swaps tokenIn to tokenOut and pays the seller
    function executeAndSwap(uint256 purchaseId, uint24 poolFee) external nonReentrant onlyKeeperHub {
        Purchase storage purchase = purchases[purchaseId];
        if (purchase.buyer == address(0)) {
            revert InvalidPurchase();
        }
        if (purchase.executed) {
            revert AlreadyExecuted();
        }

        DataListing storage listing = listings[purchase.listingId];
        if (listing.sellerWallet == address(0)) {
            revert InvalidListing();
        }

        purchase.executed = true;

        uint256 amountOut;
        if (purchase.tokenOut == listing.tokenIn) {
            if (!IERC20(listing.tokenIn).transfer(listing.sellerWallet, listing.price)) {
                revert TransferFailed();
            }
            amountOut = listing.price;
        } else {
            if (!IERC20(listing.tokenIn).approve(address(swapRouter), listing.price)) {
                revert TransferFailed();
            }

            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: listing.tokenIn,
                tokenOut: purchase.tokenOut,
                fee: poolFee,
                recipient: listing.sellerWallet,
                deadline: block.timestamp + 15 minutes,
                amountIn: listing.price,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

            amountOut = swapRouter.exactInputSingle(params);
        }

        emit PurchaseExecuted(purchaseId, purchase.listingId, listing.sellerWallet, purchase.tokenOut, amountOut);
    }
}
