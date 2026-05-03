import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Indexer } from "@0glabs/0g-ts-sdk";
import { JsonRpcProvider } from "ethers";
import { readFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

type MeritTask = {
  taskName: string;
  clientEns: string;
  storageHash: string;
  reputationScore: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ens: string }> }
) {
  const { ens } = await params;

  if (!ens) {
    return NextResponse.json(
      { error: "Missing ENS parameter" },
      { status: 400 }
    );
  }

  const ensRpcUrl = process.env.ENS_RPC_URL;
  const indexerUrl = process.env.ZEROG_INDEXER_URL;

  if (!ensRpcUrl || !indexerUrl) {
    return NextResponse.json(
      { error: "Missing ENS_RPC_URL or ZEROG_INDEXER_URL" },
      { status: 500 }
    );
  }

  try {
    const provider = new JsonRpcProvider(ensRpcUrl);
    const resolver = await provider.getResolver(ens);
    if (!resolver) {
      return NextResponse.json(
        { error: "ENS resolver not found" },
        { status: 404 }
      );
    }

    const storageHash = await resolver.getText("0g-merit-hash");
    if (!storageHash) {
      return NextResponse.json(
        { error: "Missing 0g-merit-hash text record" },
        { status: 404 }
      );
    }

    const indexer = new Indexer(indexerUrl);
    const tmpFile = path.join(
      os.tmpdir(),
      `agentic-ocean-${encodeURIComponent(ens)}.json`
    );

    const downloadError = await indexer.download(storageHash, tmpFile, true);
    if (downloadError) {
      return NextResponse.json(
        { error: "Failed to download merit log from 0G" },
        { status: 502 }
      );
    }

    const raw = await readFile(tmpFile, "utf-8");
    const parsed = JSON.parse(raw) as
      | { taskName: string; clientRating?: number; agentEns?: string }
      | Array<{ taskName: string; clientRating?: number; agentEns?: string }>;

    const entries = Array.isArray(parsed) ? parsed : [parsed];
    const tasks: MeritTask[] = entries.map((entry) => ({
      taskName: entry.taskName ?? "Completed Task",
      clientEns: entry.agentEns ?? ens,
      storageHash,
      reputationScore: `${entry.clientRating ?? 0}/100`,
    }));

    return NextResponse.json({ ens, tasks });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to resolve merit logs" },
      { status: 500 }
    );
  }
}
