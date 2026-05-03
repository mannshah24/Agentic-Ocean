import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AxlDeliveryPayload = {
  buyerEns: string;
  sellerEns: string;
  listingId: string | number;
  transactionHash: string;
};

type AxlDeliveryResponse = {
  decryptionKey: string;
  listingId: string | number;
  sellerEns: string;
  buyerEns: string;
};

const GENSYN_RELAY_WSS =
  process.env.GENSYN_WSS_URL || "wss://relay.gensyn.network/v1/axl";
const AXL_DEMO_FALLBACK_ENABLED = process.env.AXL_DEMO_FALLBACK !== "false";

function buildMockDelivery(
  body: Partial<AxlDeliveryPayload>,
  reason: "NETWORK_ERROR" | "TIMEOUT_NO_KEY",
) {
  const listingId = body.listingId ?? "unknown";
  const sellerEns = body.sellerEns ?? "unknown.seller.eth";
  const buyerEns = body.buyerEns ?? "unknown.buyer.eth";
  const txSuffix = (body.transactionHash ?? "0x").slice(-8) || "demo";

  return {
    ok: true,
    mocked: true,
    reason,
    decryptionKey: `demo-key-${listingId}-${txSuffix}`,
    listingId,
    sellerEns,
    buyerEns,
  };
}

export async function POST(request: NextRequest) {
  let body: Partial<AxlDeliveryPayload> = {};

  try {
    body = (await request.json()) as Partial<AxlDeliveryPayload>;

    if (
      !body.buyerEns ||
      !body.sellerEns ||
      body.listingId === undefined ||
      !body.transactionHash
    ) {
      return NextResponse.json(
        {
          error:
            "Missing buyerEns, sellerEns, listingId, or transactionHash",
        },
        { status: 400 }
      );
    }

    const result = await new Promise<AxlDeliveryResponse>((resolve, reject) => {
      const ws = new WebSocket(GENSYN_RELAY_WSS);

      const timeoutId = setTimeout(() => {
        ws.close();
        reject(new Error("TIMEOUT_NO_KEY"));
      }, 10000);

      ws.onopen = () => {
        const message = {
          type: "AXL_DELIVERY_REQUEST",
          topic: `axl-delivery:${body.sellerEns}`,
          payload: {
            buyerEns: body.buyerEns,
            sellerEns: body.sellerEns,
            listingId: body.listingId,
            transactionHash: body.transactionHash,
          },
        };

        ws.send(JSON.stringify(message));
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data.toString());

          if (
            response.type === "AXL_DELIVERY_KEY" &&
            response.payload?.listingId == body.listingId &&
            response.payload?.sellerEns === body.sellerEns
          ) {
            clearTimeout(timeoutId);
            ws.close();

            resolve({
              decryptionKey: response.payload.decryptionKey,
              listingId: response.payload.listingId,
              sellerEns: response.payload.sellerEns,
              buyerEns: response.payload.buyerEns ?? body.buyerEns,
            });
          }
        } catch (error) {
          console.error("Failed to parse AXL message:", error);
        }
      };

      ws.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error("NETWORK_ERROR"));
      };
    });

    return NextResponse.json({
      ok: true,
      mocked: false,
      decryptionKey: result.decryptionKey,
      listingId: result.listingId,
      sellerEns: result.sellerEns,
      buyerEns: result.buyerEns,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (
      AXL_DEMO_FALLBACK_ENABLED &&
      (message === "TIMEOUT_NO_KEY" || message === "NETWORK_ERROR")
    ) {
      return NextResponse.json(buildMockDelivery(body, message));
    }

    console.error("AXL delivery failed:", error);
    return NextResponse.json(
      { error: "Failed to deliver decryption key" },
      { status: 500 }
    );
  }
}
