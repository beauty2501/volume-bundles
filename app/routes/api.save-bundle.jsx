import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { syncBundleMetafields } from "../utils/bundle-metafields.server";

export const action = async ({ request }) => {

  try {

    const { admin } = await authenticate.admin(request); //request came from authenticated Shopify admin

    const body = await request.json();

    const {
      id,
      bundleName,
      title,
      selectionType,
      productIds,
      quantityBreaks,
    } = body;

    const cleanedBreaks = quantityBreaks.map((b) => ({
      quantity: b.quantity,
      value: b.value || 0,
      description: b.description || "",
      savingsText: b.savingsText || "",
    }));

    // const config = {
    //   title,
    //   selectionType,
    //   breaks: cleanedBreaks,
    // };

    // if (selectionType.includes("all")) {

    //   await admin.graphql(`
    //     mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    //       metafieldsSet(metafields: $metafields) {
    //         metafields { id }
    //         userErrors { field message }
    //       }
    //     }
    //   `, {
    //     variables: {
    //       metafields: [
    //         {
    //           namespace: "bundle",
    //           key: "global_config",
    //           type: "json",
    //           ownerId: "gid://shopify/Shop/1",
    //           value: JSON.stringify(config),
    //         },
    //       ],
    //     },
    //   });

    // }

    // if (selectionType.includes("specific")) {

    //   for (const product of productIds) {

    //     await admin.graphql(`
    //       mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    //         metafieldsSet(metafields: $metafields) {
    //           metafields { id }
    //           userErrors { field message }
    //         }
    //       }
    //     `, {
    //       variables: {
    //         metafields: [
    //           {
    //             namespace: "bundle",
    //             key: "config",
    //             type: "json",
    //             ownerId: product.id,
    //             value: JSON.stringify(config),
    //           },
    //         ],
    //       },
    //     });

    //   }

    // }
   
    const bundleData = {
      bundleName,
      title,
      selectionType: selectionType[0],
    
      productType:
        selectionType.includes("all")
          ? "All products"
          : "Specific products",
    
      status: "Active",
    
      metafieldKey:
        selectionType.includes("all")
          ? "global_config"
          : "config",
    
      productIds: JSON.stringify(productIds),
      quantityBreaks: JSON.stringify(cleanedBreaks),
    };
    
    const savedBundle = id
      ? await prisma.bundle.update({
          where: {
            id: Number(id),
          },
          data: bundleData,
        })
      : await prisma.bundle.create({
          data: bundleData,
        });

        await syncBundleMetafields(admin, {
          preferBundleId: savedBundle.id,
        });

    return json({
      success: true,
      bundle: savedBundle,
    });

  } catch (error) {

    // console.error("SAVE ERROR:", error);

    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
};