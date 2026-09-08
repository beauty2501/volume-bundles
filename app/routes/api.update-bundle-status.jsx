import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { syncBundleMetafields } from "../utils/bundle-metafields.server";

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    const body = await request.json();

    const { bundleIds, status } = body;

    await prisma.bundle.updateMany({
      where: {
        id: {
          in: bundleIds,
        },
      },
      data: {
        status,
      },
    });

    await syncBundleMetafields(admin, {
      preferBundleId:
        status === "Active" ? bundleIds?.[0] : undefined,
    });

    return json({
      success: true,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);

    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
};