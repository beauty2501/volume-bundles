export default function SelectedProducts({
    selectedProducts,
    handleOpenPicker,
  }) {
    return (
      <s-section heading="Discounted products in bundle">
        <s-box padding="base" borderWidth="base" borderRadius="base">
  
          {/* Product List */}
          <div>
            <div style={{ marginBottom: "10px", fontWeight: 500 }}>
              Showing {selectedProducts.length} products
            </div>
  
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                }}
              >
                {/* LEFT SIDE */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  
                  <s-checkbox></s-checkbox>
  
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ fontWeight: 500 }}>
                      {product.title}
                    </div>
  
                    <div style={{ fontSize: "12px", color: "#6d7175" }}>
                      ({product.variants?.length || 0} variants)
                    </div>
                  </div>
  
                </div>
              </div>
            ))}
          </div>
  
          {/* Bottom Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginTop: "12px"
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>
                Discounted products in bundle
              </div>
  
              <div style={{ fontSize: "13px", color: "#6d7175", marginTop: "4px" }}>
                To apply discount, select specific products.
              </div>
            </div>
  
            <s-button onClick={handleOpenPicker}>
              Select products
            </s-button>
          </div>
  
        </s-box>
      </s-section>
    );
  }