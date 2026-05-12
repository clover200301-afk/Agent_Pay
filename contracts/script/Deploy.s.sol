// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import {AgentPay} from "../src/AgentPay.sol";

contract DeployAgentPay is Script {
    function run() external returns (AgentPay deployed) {
        uint256 pk = vm.envUint("OWNER_PRIVATE_KEY");
        address usdc = vm.envAddress("USDC_ADDRESS");

        vm.startBroadcast(pk);
        deployed = new AgentPay(usdc);
        vm.stopBroadcast();

        // Convention: scripts/deploy.sh greps this exact line.
        console.log("AgentPay deployed at:", address(deployed));
        console.log("USDC wired to:", usdc);
    }
}
