import {
  ProductDiscountSelectionStrategy,
} from '../generated/api';

/**
  * @typedef {import("../generated/api").CartInput} RunInput
  * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
  */

/**
  * @param {RunInput} input
  * @returns {CartLinesDiscountsGenerateRunResult}
  */
export function cartLinesDiscountsGenerateRun(input) {
  const candidates = [];
  const productGroups = {};
  const shopConfigValue = input.shop?.metafield?.value;

  for (const line of input.cart.lines) {
    if (!line.attribute?.value) continue;

    const productId = line.merchandise?.product?.id;
    if (!productId) continue;

    if (!productGroups[productId]) {
      productGroups[productId] = {
        totalQty: 0,
        lines: [],
        configValue:
          line.merchandise?.product?.metafield?.value || shopConfigValue,
      };
    }

    productGroups[productId].totalQty += line.quantity;
    productGroups[productId].lines.push(line);
  }

  for (const productId in productGroups) {
    const group = productGroups[productId];

    if (!group.configValue) continue;

    let config;
    try {
      config = JSON.parse(group.configValue);
    } catch {
      continue;
    }

    if (config.status && config.status !== "Active") continue;

    if (!config.breaks?.length) continue;

    const breaks = [...config.breaks].sort(
      (a, b) => Number(b.quantity) - Number(a.quantity)
    );

    let remainingQty = group.totalQty;
    const lineUsage = {};

    for (const line of group.lines) {
      lineUsage[line.id] = 0;
    }

    for (const breakItem of breaks) {
      const bundleQty = Number(breakItem.quantity);
      const discountValue = Number(breakItem.value);

      if (!bundleQty || !discountValue) continue;

      const bundleCount = Math.floor(remainingQty / bundleQty);
      if (bundleCount <= 0) continue;

      const qtyToDiscount = bundleCount * bundleQty;
      remainingQty -= qtyToDiscount;

      let qtyLeftToAllocate = qtyToDiscount;
      const targets = [];

      for (const line of group.lines) {
        if (qtyLeftToAllocate <= 0) break;

        const availableQty = line.quantity - lineUsage[line.id];
        if (availableQty <= 0) continue;

        const discountedQty = Math.min(availableQty, qtyLeftToAllocate);
        qtyLeftToAllocate -= discountedQty;
        lineUsage[line.id] += discountedQty;

        targets.push({
          cartLine: {
            id: line.id,
            quantity: discountedQty,
          },
        });
      }

      if (targets.length) {
        candidates.push({
          message: `${discountValue}% OFF`,
          targets,
          value: {
            percentage: {
              value: discountValue,
            },
          },
        });
      }
    }
  }

  if (!candidates.length) {
    return {
      operations: [],
    };
  }

  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates,
          selectionStrategy: ProductDiscountSelectionStrategy.All,
        },
      },
    ],
  };
}
