import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Indexer, MemData } from "@0glabs/0g-ts-sdk";
import { JsonRpcProvider, Wallet } from "ethers";

type DataUploadPayload = {
  agentEns: string;
  encryptedDataPayload: unknown;
  dataMetadata: Record<string, unknown>;
};

type TeeValidationResult = {
  teeQualityScore: number;
};

// Placeholder for 0G Compute (Sealed TEE inference) validation.
// In production, this would invoke an enclave that scores encrypted data
// without revealing plaintext.
async function validateDataQualityInEnclave(
  ogStorageHash: string
): Promise<TeeValidationResult> {
  const normalized = ogStorageHash.replace(/^0x/, "");
  const seed = parseInt(normalized.slice(0, 6) || "1", 16);
  const score = (seed % 100) + 1;

  return { teeQualityScore: score };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<DataUploadPayload>;

    if (!body.agentEns || !body.encryptedDataPayload || !body.dataMetadata) {
      return NextResponse.json(
        { error: "Missing agentEns, encryptedDataPayload, or dataMetadata" },
        { status: 400 }
      );
    }

    const rpcUrl = process.env.ZEROG_RPC_URL;
    const privateKey = process.env.ZEROG_PRIVATE_KEY;
    const indexerUrl = process.env.ZEROG_INDEXER_URL;

    if (!rpcUrl || !privateKey || !indexerUrl) {
      return NextResponse.json(
        { error: "Missing ZEROG_RPC_URL, ZEROG_PRIVATE_KEY, or ZEROG_INDEXER_URL" },
        { status: 500 }
      );
    }

    const payload = {
      agentEns: body.agentEns,
      encryptedDataPayload: body.encryptedDataPayload,
      dataMetadata: body.dataMetadata,
      uploadedAt: new Date().toISOString(),
    };

    const provider = new JsonRpcProvider(rpcUrl);
    const wallet = new Wallet(privateKey, provider);
    const indexer = new Indexer(indexerUrl);
    const uploadWallet = wallet as unknown as any;

    const buffer = Buffer.from(JSON.stringify(payload));
    const file = new MemData(buffer);

    const [result, uploadError] = await indexer.upload(
      file,
      rpcUrl,
      uploadWallet,
      undefined,
      undefined,
      undefined
    );

    if (uploadError || !result) {
      console.error("0G upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload encrypted data to 0G Storage" },
        { status: 500 }
      );
    }

    const teeValidation = await validateDataQualityInEnclave(result.rootHash);

    return NextResponse.json({
      ok: true,
      storageHash: result.rootHash,
      txHash: result.txHash,
      teeQualityScore: teeValidation.teeQualityScore,
    });
  } catch (error) {
    console.error("0G SDK error:", error);
    return NextResponse.json(
      { error: "Failed to upload encrypted data" },
      { status: 500 }
    );
  }
}
