import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { syncBundleMetafields } from "../utils/bundle-metafields.server";

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    const body = await request.json();

    const { bundleIds } = body;

    await prisma.bundle.deleteMany({
      where: {
        id: {
          in: bundleIds,
        },
      },
    });

    await syncBundleMetafields(admin);

    return json({
      success: true,
    });
  } catch (error) {
    // console.error("DELETE BUNDLES ERROR:", error);

    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
};