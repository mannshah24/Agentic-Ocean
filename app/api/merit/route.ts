import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Indexer, MemData } from "@0glabs/0g-ts-sdk";
import { JsonRpcProvider, Wallet } from "ethers";

type MeritPayload = {
  agentEns: string;
  taskName: string;
  clientRating: number;
  codeHash: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<MeritPayload>;

    if (!body.agentEns || !body.taskName || !body.codeHash) {
      return NextResponse.json(
        { error: "Missing agentEns, taskName, or codeHash" },
        { status: 400 }
      );
    }

    const meritLog = {
      agentEns: body.agentEns,
      taskName: body.taskName,
      clientRating: body.clientRating ?? 0,
      codeHash: body.codeHash,
      createdAt: new Date().toISOString(),
    };

    const rpcUrl = process.env.ZEROG_RPC_URL;
    const privateKey = process.env.ZEROG_PRIVATE_KEY;
    const indexerUrl = process.env.ZEROG_INDEXER_URL;

    if (!rpcUrl || !privateKey || !indexerUrl) {
      return NextResponse.json(
        { error: "Missing ZEROG_RPC_URL, ZEROG_PRIVATE_KEY, or ZEROG_INDEXER_URL" },
        { status: 500 }
      );
    }

    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(privateKey, provider);
    const indexer = new Indexer(indexerUrl);

    // Convert the merit log to a buffer and upload via 0G Indexer.
    const buffer = Buffer.from(JSON.stringify(meritLog));
    const file = new MemData(buffer);

    const [result, uploadError] = await indexer.upload(
      file,
      rpcUrl,
      wallet,
      undefined,
      undefined,
      undefined
    );

    if (uploadError || !result) {
      console.error("0G upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload to 0G Storage" },
        { status: 500 }
      );
    }

    // This root hash is the immutable Merit Log reference that can be attached
    // to the agent ENS text record (key: 0g-merit-hash) later.
    return NextResponse.json({
      ok: true,
      storageHash: result.rootHash,
      txHash: result.txHash,
    });
  } catch (error) {
    console.error("0G SDK error:", error);
    return NextResponse.json(
      { error: "Failed to store merit log" },
      { status: 500 }
    );
  }
}
