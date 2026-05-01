"use client";

import { useState } from "react";
import { keccak256, toHex } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
const USDC_ADDRESS = "0x0000000000000000000000000000000000000000";
const PAYOUT_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

const CONTRACT_ABI = [
  {
    type: "function",
    name: "createEscrow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "escrowId", type: "bytes32" },
      { name: "agent", type: "address" },
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "executeTaskPayout",
    stateMutability: "nonpayable",
    inputs: [{ name: "escrowId", type: "bytes32" }],
    outputs: [],
  },
] as const;

function generateEscrowId(agentAddress: `0x${string}`) {
  return keccak256(toHex(`${agentAddress}-${Date.now()}`));
}

export function useEscrowContract() {
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);

  const receipt = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    query: { enabled: Boolean(txHash) },
  });

  async function hireAgent(agentAddress: `0x${string}`, amount: bigint) {
    setLastError(null);
    const escrowId = generateEscrowId(agentAddress);

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "createEscrow",
        args: [escrowId, agentAddress, USDC_ADDRESS, PAYOUT_TOKEN_ADDRESS, amount],
      });

      setTxHash(hash);
      return { hash, escrowId };
    } catch (error) {
      setLastError(error as Error);
      throw error;
    }
  }

  async function executePayout(taskId: `0x${string}`) {
    setLastError(null);

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "executeTaskPayout",
        args: [taskId],
      });

      setTxHash(hash);
      return { hash };
    } catch (error) {
      setLastError(error as Error);
      throw error;
    }
  }

  return {
    hireAgent,
    executePayout,
    txHash,
    isConfirming: receipt.isLoading,
    isConfirmed: receipt.isSuccess,
    receipt: receipt.data,
    error: lastError ?? (receipt.error as Error | null) ?? null,
  };
}
