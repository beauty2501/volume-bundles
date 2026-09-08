import { useEffect } from "react";

function fieldValue(e) {
  if (typeof e === "string" || typeof e === "number") return e;
  return e?.currentTarget?.value ?? e?.target?.value ?? "";
}

export default function QuantityBreak({ value = [], onChange, onInit }) {
  const MAX_BREAKS = 5;

  const getDefaultDescription = (q) =>
    q === 1 ? "Buy 1" : "Buy {{quantity}} and get a discount!";

  const getDefaultSavings = () =>
    "Save {{discount_value}}{{discount_unit}}";

  const getDefaultBreak = (index) => ({
    id: `break-${index}-${Date.now()}`,
    quantity: index + 1,
    value: index === 0 ? 0 : 10,
    description: getDefaultDescription(index + 1),
    savingsText: getDefaultSavings(),
    isCustomDescription: false,
  });

  useEffect(() => {
    if (!value || value.length === 0) {
      const initial = [getDefaultBreak(0), getDefaultBreak(1)];
      onInit && onInit(initial);
    }
  }, []);

  const breaks = value || [];

  const update = (data) => {
    onChange && onChange(data);
  };

  const handleAdd = () => {
    if (breaks.length >= MAX_BREAKS) return;

    const nextQty = breaks.length + 1;

    update([
      ...breaks,
      {
        id: `break-${nextQty}-${Date.now()}`,
        quantity: nextQty,
        value: 0,
        description: getDefaultDescription(nextQty),
        savingsText: getDefaultSavings(),
        isCustomDescription: false,
      },
    ]);
  };

  const handleRemove = (index) => {
    if (index === 0) return;

    const updated = breaks
      .filter((_, i) => i !== index)
      .map((b, idx) => ({
        ...b,
        id: b.id || `break-${idx}`,
        quantity: idx + 1,
        ...(b.isCustomDescription
          ? {}
          : { description: getDefaultDescription(idx + 1) }),
      }));

    update(updated);
  };

  const handleChange = (index, field, val) => {
    const updated = breaks.map((b, i) => {
      if (i !== index) return b;

      let next = { ...b, id: b.id || `break-${i}`, [field]: val };

      if (field === "quantity" && !b.isCustomDescription) {
        next.description = getDefaultDescription(Number(val));
      }

      return next;
    });

    update(updated);
  };

  const handleDescriptionChange = (index, val) => {
    const updated = breaks.map((b, i) =>
      i === index
        ? { ...b, id: b.id || `break-${i}`, description: val, isCustomDescription: true }
        : b
    );

    update(updated);
  };

  return (
    <s-section heading="Quantity breaks">
      {breaks.map((item, index) => (
        <s-box
          key={item.id || `break-${index}`}
          padding="base"
          borderWidth="base"
          borderRadius="base"
          style={{ marginBottom: 16 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>QUANTITY BREAK #{index + 1}</strong>

            <div style={{ display: "flex", gap: 10 }}>
              {index === breaks.length - 1 && breaks.length < MAX_BREAKS && (
                <s-button variant="tertiary" onClick={handleAdd}>
                  Add quantity break
                </s-button>
              )}

              {index !== 0 && (
                <s-button
                  tone="critical"
                  variant="tertiary"
                  onClick={() => handleRemove(index)}
                >
                  Remove
                </s-button>
              )}
            </div>
          </div>

          <br />

          <div style={{ display: "flex", gap: 16 }}>
            <s-number-field
              label="Quantity"
              name={`quantity-break-${index}-quantity`}
              value={String(item.quantity ?? "")}
              min={1}
              onChange={(e) =>
                handleChange(index, "quantity", Number(fieldValue(e)) || 1)
              }
            />

            <s-number-field
              label="Discount (%)"
              name={`quantity-break-${index}-discount`}
              value={String(item.value ?? "")}
              min={0}
              max={100}
              suffix="%"
              onChange={(e) =>
                handleChange(index, "value", Number(fieldValue(e)) || 0)
              }
            />
          </div>

          <br />

          <s-text-field
            label="Savings text"
            name={`quantity-break-${index}-savings`}
            value={item.savingsText || ""}
            onChange={(e) =>
              handleChange(index, "savingsText", String(fieldValue(e)))
            }
          />

          <br />

          <s-text-field
            label="Description"
            name={`quantity-break-${index}-description`}
            value={item.description || ""}
            onChange={(e) =>
              handleDescriptionChange(index, String(fieldValue(e)))
            }
          />
        </s-box>
      ))}
    </s-section>
  );
}
