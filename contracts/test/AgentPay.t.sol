// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import {AgentPay} from "../src/AgentPay.sol";

/// @dev Minimal ERC20 mock for unit tests. Mints freely; tracks allowances.
contract MockUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "allowance");
        require(balanceOf[from] >= amount, "balance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract AgentPayTest is Test {
    AgentPay internal pay;
    MockUSDC internal usdc;
    address payable internal receiver;
    address internal payer = address(0xA11CE);

    event PaymentCompleted(
        address indexed payer,
        address indexed receiver,
        address token,
        uint256 amount,
        bytes32 taskId
    );

    function setUp() public {
        usdc = new MockUSDC();
        pay = new AgentPay(address(usdc));
        receiver = payable(address(0xB0B));
        vm.deal(payer, 10 ether);
        usdc.mint(payer, 1_000_000); // 1 USDC (6 decimals)
    }

    function test_PayTransfersNative() public {
        uint256 before = receiver.balance;
        vm.prank(payer);
        pay.pay{value: 0.5 ether}(receiver, keccak256("task-1"));
        assertEq(receiver.balance - before, 0.5 ether);
    }

    function test_PayEmitsEventWithZeroToken() public {
        bytes32 taskId = keccak256("task-2");
        vm.expectEmit(true, true, false, true);
        emit PaymentCompleted(payer, receiver, address(0), 0.25 ether, taskId);
        vm.prank(payer);
        pay.pay{value: 0.25 ether}(receiver, taskId);
    }

    function test_PayWithUSDCTransfers() public {
        vm.prank(payer);
        usdc.approve(address(pay), 500_000);

        vm.prank(payer);
        pay.payWithUSDC(receiver, 500_000, keccak256("task-usdc"));

        assertEq(usdc.balanceOf(receiver), 500_000);
        assertEq(usdc.balanceOf(payer), 500_000);
    }

    function test_PayWithUSDCEmitsEvent() public {
        vm.prank(payer);
        usdc.approve(address(pay), 300_000);

        bytes32 taskId = keccak256("task-usdc-event");
        vm.expectEmit(true, true, false, true);
        emit PaymentCompleted(payer, receiver, address(usdc), 300_000, taskId);
        vm.prank(payer);
        pay.payWithUSDC(receiver, 300_000, taskId);
    }

    function test_RevertOnZeroValue() public {
        vm.prank(payer);
        vm.expectRevert(AgentPay.ZeroAmount.selector);
        pay.pay{value: 0}(receiver, bytes32(0));
    }

    function test_RevertOnZeroReceiverUSDC() public {
        vm.prank(payer);
        vm.expectRevert(AgentPay.ZeroReceiver.selector);
        pay.payWithUSDC(address(0), 100, bytes32(0));
    }

    function test_RevertOnZeroAmountUSDC() public {
        vm.prank(payer);
        vm.expectRevert(AgentPay.ZeroAmount.selector);
        pay.payWithUSDC(receiver, 0, bytes32(0));
    }

    function test_RevertOnZeroUSDCInConstructor() public {
        vm.expectRevert(AgentPay.ZeroReceiver.selector);
        new AgentPay(address(0));
    }
}
