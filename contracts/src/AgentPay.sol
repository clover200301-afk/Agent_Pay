// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Minimal ERC20 surface used by AgentPay (Monad Testnet USDC).
interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title AgentPay
/// @notice Minimal payment router for AI-agent-driven purchases on Monad.
///         Supports both native MON and a single configured ERC20 (USDC).
///         Funds are forwarded to the merchant in the same transaction —
///         the contract holds no balance.
contract AgentPay {
    /// @dev token == address(0) for native MON; otherwise the ERC20 token address.
    event PaymentCompleted(
        address indexed payer,
        address indexed receiver,
        address token,
        uint256 amount,
        bytes32 taskId
    );

    error ZeroAmount();
    error ZeroReceiver();
    error TransferFailed();

    /// @notice The single configured ERC20 (Monad Testnet USDC).
    address public immutable usdc;

    constructor(address usdc_) {
        if (usdc_ == address(0)) revert ZeroReceiver();
        usdc = usdc_;
    }

    /// @notice Pay `receiver` in native MON. Forwards msg.value 1:1.
    function pay(address receiver, bytes32 taskId) external payable {
        if (msg.value == 0) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroReceiver();

        (bool ok, ) = receiver.call{value: msg.value}("");
        if (!ok) revert TransferFailed();

        emit PaymentCompleted(msg.sender, receiver, address(0), msg.value, taskId);
    }

    /// @notice Pay `receiver` in USDC. Caller MUST have approved this contract
    ///         for at least `amount` on the USDC token before calling.
    function payWithUSDC(address receiver, uint256 amount, bytes32 taskId) external {
        if (amount == 0) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroReceiver();

        bool ok = IERC20(usdc).transferFrom(msg.sender, receiver, amount);
        if (!ok) revert TransferFailed();

        emit PaymentCompleted(msg.sender, receiver, usdc, amount, taskId);
    }
}
