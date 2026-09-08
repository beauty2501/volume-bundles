export default function WidgetPreview({ title, breaks, currency }) {

    // Replace placeholders dynamically
    const replace = (text, item) => {
      if (!text) return "";
      return text
        .replace(/{{quantity}}/g, item.quantity)
        .replace(/{{discount_value}}/g, item.value)
        .replace(/{{discount_unit}}/g, "%");
    };

    const formatPrice = (amount) =>
        new Intl.NumberFormat("en", {
          style: "currency",
          currency,
        }).format(amount);
  
    const BASE_PRICE = 10;
  
    return (
        <div
        style={{
            position: "sticky",
            top: "20px",
        }}
        >
      <s-box
        padding="base"
        borderWidth="base"
        borderRadius="base"
        background="subdued"
        class="level-1"
      >
        <h3>Widget preview</h3>
  
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <strong>- {title} -</strong>
        </div>
  
        {/* KEY: directly use breaks */}
        {breaks.map((item, index) => {
          const original = BASE_PRICE * item.quantity;
          const discounted =
            original - (original * item.value) / 100;
  
          return (
            <div
              key={item.id || `preview-${index}`}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                borderRadius: 10,
                marginBottom: 10,
                background: index === 0 ? "#eef3ff" : "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* Badge */}
              {item.value > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -8,
                    right: 10,
                    background: "#2c6ecb",
                    color: "#fff",
                    padding: "2px 8px",
                    fontSize: 12,
                    borderRadius: 12,
                  }}
                >
                  Save {item.value}%
                </div>
              )}
  
              {/* Left */}
              <div>
                <input type="radio" checked={index === 0} readOnly />{" "}
                {replace(item.description, item)}
  
                {item.value > 0 && (
                  <div style={{ fontSize: 12, color: "green" }}>
                    {replace(item.savingsText, item)}
                  </div>
                )}
              </div>
  
              {/* Right */}
              <div style={{ textAlign: "right" }}>
                <div>{formatPrice(discounted)}</div>
  
                {item.value > 0 && (
                  <div
                    style={{
                      textDecoration: "line-through",
                      fontSize: 12,
                      color: "#999",
                    }}
                  >
                    {formatPrice(original)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </s-box>
      </div>
    );
  }