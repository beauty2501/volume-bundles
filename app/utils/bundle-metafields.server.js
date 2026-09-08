import prisma from "../db.server";

function parseBreakSummary(quantityBreaks) {
  try {
    return JSON.parse(quantityBreaks || "[]").map((item) => ({
      quantity: item.quantity,
      value: item.value,
    }));
  } catch {
    return [];
  }
}

async function getShopId(admin) {
  const response = await admin.graphql(`
    query {
      shop {
        id
      }
    }
  `);

  const data = await response.json();
  return data.data.shop.id;
}

async function setMetafield(admin, metafield) {
  const response = await admin.graphql(
    `
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { id }
          userErrors { field message }
        }
      }
    `,
    {
      variables: {
        metafields: [metafield],
      },
    },
  );
  const data = await response.json();

  if (data?.data?.metafieldsSet?.userErrors?.length) {
    console.error(
      "[bundle sync] metafieldsSet errors",
      data.data.metafieldsSet.userErrors,
    );
  }
}

async function deleteMetafield(admin, ownerId, namespace, key) {
  const response = await admin.graphql(
    `
      mutation metafieldsDelete($metafields: [MetafieldIdentifierInput!]!) {
        metafieldsDelete(metafields: $metafields) {
          deletedMetafields {
            ownerId
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            ownerId,
            namespace,
            key,
          },
        ],
      },
    },
  );

  const data = await response.json();
  if (data?.data?.metafieldsDelete?.userErrors?.length) {
    console.error(
      "[bundle sync] metafieldsDelete errors",
      data.data.metafieldsDelete.userErrors,
    );
  }
}

async function deleteAllProductBundleConfigs(admin) {
  let cursor = null;
  let hasNext = true;
  const deleted = [];

  while (hasNext) {
    const response = await admin.graphql(
      `
        query ProductBundleConfigs($cursor: String) {
          products(first: 50, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              title
              metafield(namespace: "bundle", key: "config") {
                id
                value
              }
            }
          }
        }
      `,
      {
        variables: { cursor },
      },
    );

    const data = await response.json();
    const connection = data?.data?.products;
    if (!connection) break;

    for (const product of connection.nodes) {
      if (!product.metafield?.id) continue;

      console.log("[bundle sync] deleting leftover product.bundle.config", {
        title: product.title,
        id: product.id,
        value: product.metafield.value,
      });

      await deleteMetafield(admin, product.id, "bundle", "config");
      deleted.push(product.title);
    }

    hasNext = connection.pageInfo.hasNextPage;
    cursor = connection.pageInfo.endCursor;
  }

  return deleted;
}

function buildPayload(bundle) {
  return {
    title: bundle.title,
    selectionType: [bundle.selectionType],
    status: "Active",
    breaks: JSON.parse(bundle.quantityBreaks),
  };
}

export async function syncBundleMetafields(admin) {
  const shopId = await getShopId(admin);
  const activeBundles = await prisma.bundle.findMany({
    where: {
      status: "Active",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const latest = activeBundles[0] || null;

  console.log("[bundle sync] active bundles", {
    count: activeBundles.length,
    latest: latest
      ? {
          id: latest.id,
          bundleName: latest.bundleName,
          selectionType: latest.selectionType,
          createdAt: latest.createdAt,
          breaks: parseBreakSummary(latest.quantityBreaks),
        }
      : null,
  });

  const deletedProductConfigs = await deleteAllProductBundleConfigs(admin);
  console.log("[bundle sync] leftover product configs removed", deletedProductConfigs);

  if (!latest) {
    await deleteMetafield(admin, shopId, "bundle", "global_config");
    console.log("[bundle sync] no active bundle; cleared shop.bundle.global_config");
    return;
  }

  const payload = buildPayload(latest);

  if (latest.selectionType === "all") {
    await setMetafield(admin, {
      namespace: "bundle",
      key: "global_config",
      type: "json",
      ownerId: shopId,
      value: JSON.stringify(payload),
    });
    console.log("[bundle sync] wrote shop.bundle.global_config", payload);
    return;
  }

  await deleteMetafield(admin, shopId, "bundle", "global_config");

  const products = JSON.parse(latest.productIds || "[]");
  for (const product of products) {
    if (!product?.id) continue;

    await setMetafield(admin, {
      namespace: "bundle",
      key: "config",
      type: "json",
      ownerId: product.id,
      value: JSON.stringify(payload),
    });
  }

  console.log("[bundle sync] wrote product.bundle.config", {
    products: products.map((product) => product.title || product.id),
    payload,
  });
}
