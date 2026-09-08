import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import useProductPicker from "../components/ProductPicker";
import  SelectedProducts from "../components/SelectedProducts"
import CustomSaveBar from "../components/CustomSaveBar";
import QuantityBreak from "../components/QuantityBreak";
import WidgetPreview from "../components/WidgetPreview"

export default function BundlePage({ loaderData }) {
  const location = useLocation();
  const bundle = loaderData?.bundle;

  const mode = loaderData?.mode || (bundle?.id ? "edit" : "create");

  //This converts DB JSON string into JS array.
  const parseJsonArray = (value) => {
    if (!value) return [];
    try {
      return JSON.parse(value);
    } catch (error) {
      // console.error("Invalid bundle JSON:", error);
      return [];
    }
  };

  const resolvedBundleName = bundle?.bundleName || "Quantity break";
  const resolvedTitle = bundle?.title || "BUY IN BULK AND GET A DISCOUNT!";
  const resolvedSelectionType = useMemo(
    () => (bundle?.selectionType ? [bundle.selectionType] : ["all"]),
    [bundle?.selectionType],
  );
  const resolvedProducts = useMemo(
    () => parseJsonArray(bundle?.productIds),
    [bundle?.productIds],
  );
  const resolvedBreaks = useMemo(
    () => parseJsonArray(bundle?.quantityBreaks),
    [bundle?.quantityBreaks],
  );

  // const [bundleName, setBundleName] = useState("Quantity break");
  // const [title, setTitle] = useState("BUY IN BULK AND GET A DISCOUNT!");
  // const [selectionType, setSelectionType] = useState(['all']);
  // const [selectedProducts, setSelectedProducts] = useState([]);
  // const [quantityBreaks, setQuantityBreaks] = useState([]);
  const [bundleName, setBundleName] = useState(
    resolvedBundleName
  );
  
  const [title, setTitle] = useState(
    resolvedTitle
  );
  
  const [selectionType, setSelectionType] = useState(
    resolvedSelectionType
  );
  
  const [selectedProducts, setSelectedProducts] = useState(
    resolvedProducts
  );
  
  const [quantityBreaks, setQuantityBreaks] = useState(
    resolvedBreaks
  );

  //This tracks "saved version"
const [initialState, setInitialState] = useState({
  bundleName: resolvedBundleName,

  title: resolvedTitle,

  selectionType: resolvedSelectionType,

  selectedProducts: resolvedProducts,

  quantityBreaks: resolvedBreaks,
});

  //Tracks whether QuantityBreak initialized defaults.
  const [isInitialized, setIsInitialized] = useState(false);

  //Default currency.
  const [currency, setCurrency] = useState("INR");

  //Save button loading state.
  const [isSaving, setIsSaving] = useState(false);


  //Returns function to open Shopify product selector.
  const openPicker = useProductPicker();

  useEffect(() => {
    fetch("/api/shop")
      .then((res) => res.json())
      .then((data) => setCurrency(data.currency));
  }, []);

  const handleChange = (e) => {
    setSelectionType(e.currentTarget.values);
  };
  const isSpecificSelected =
  selectionType.includes("specific");

  const handleInitBreaks = (data) => {
    setQuantityBreaks(data);
  
    setInitialState((prev) => ({
      ...prev,
      quantityBreaks: data,
    }));
  
    setIsInitialized(true);
  };

const handleOpenPicker = async () => {
  const products = await openPicker();
  setSelectedProducts(products);
};

// const [initialState, setInitialState] = useState({
//   bundleName: "Quantity break",
//   title: "BUY IN BULK AND GET A DISCOUNT!",
//   selectionType: ['all'],
//   selectedProducts: [],
//   quantityBreaks: [],
// });


//Runs when bundle data changes.
useEffect(() => {
  // In create mode, let QuantityBreak initialize defaults via onInit.
  if (!bundle && mode === "create") {
    return;
  }

  setBundleName(resolvedBundleName);
  setTitle(resolvedTitle);
  setSelectionType(resolvedSelectionType);
  setSelectedProducts(resolvedProducts);
  setQuantityBreaks(resolvedBreaks);
  setInitialState({
    bundleName: resolvedBundleName,
    title: resolvedTitle,
    selectionType: resolvedSelectionType,
    selectedProducts: resolvedProducts,
    quantityBreaks: resolvedBreaks,
  });
  setIsInitialized(false);
}, [
  bundle?.id,
  mode,
  resolvedBundleName,
  resolvedTitle,
  resolvedSelectionType,
  resolvedProducts,
  resolvedBreaks,
]);

const isDirty =
  bundleName !== initialState.bundleName ||
  title !== initialState.title ||
  JSON.stringify(selectionType) !== JSON.stringify(initialState.selectionType) ||
  JSON.stringify(selectedProducts) !== JSON.stringify(initialState.selectedProducts) ||
  JSON.stringify(quantityBreaks) !== JSON.stringify(initialState.quantityBreaks);
  const saveBundleData = async () => {
    setIsSaving(true);
  
    try {
      const payload = {
        id: mode === "copy" ? null : bundle?.id,
      
        bundleName,
        title,
        selectionType,
      
        productIds:
          selectionType.includes("specific")
            ? selectedProducts
            : [],
      
        quantityBreaks,
      };
  
      const response = await fetch("/api/save-bundle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save bundle");
      }
  
      // update initial state AFTER successful save
      setInitialState({
        bundleName,
        title,
        selectionType,
        selectedProducts,
        quantityBreaks,
      });
  
    } catch (error) {
      // console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  const handleSave = () => {
    // only update saved form state
    setInitialState({
      bundleName,
      title,
      selectionType,
      selectedProducts,
      quantityBreaks,
    });
  };

  
  const handleSaveBundle = async () => {

    // validation for specific products
    if (
      selectionType.includes("specific") &&
      selectedProducts.length === 0
    ) {
      return;
    }
  
    await saveBundleData();
    handleSave();
  };

  const handleDiscard = () => {
    setBundleName(initialState.bundleName);
    setTitle(initialState.title);
    setSelectionType(initialState.selectionType);
    setSelectedProducts(initialState.selectedProducts);
    setQuantityBreaks(initialState.quantityBreaks);
  };

  return (
    <s-page heading="Bundle">
      {/* <s-banner tone="info">
        Current mode: {mode} {bundle?.id ? `(Bundle ID: ${bundle.id})` : ""} | Path: {location.pathname}
      </s-banner> */}

      <CustomSaveBar
        isDirty={isDirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />

      {/* Save Button */}
      <s-button slot="primary-action" variant="primary" onClick={handleSaveBundle}>
      {isSaving ? "Saving..." : "Save bundle"}
      </s-button>

      {/* Info Banner */}
      <s-banner>
        Quantity break widget will be displayed above add to cart button.
      </s-banner>

      <div style={{ display: "flex", gap: "24px" }}>
      <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* General Information */}
      <s-section heading="General information">
        <s-box padding="base" borderWidth="base" borderRadius="base">

          {/* Bundle Name */}
          <s-text-field
            label="Bundle name"
            value={bundleName}
            onChange={(e) => setBundleName(e.target.value)}
          />

          <br />

          {/* Title */}
          <s-text-field
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

        </s-box>
      </s-section>

      <s-section heading="">
  <s-box padding="base" borderWidth="base" borderRadius="base">

    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      <label style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="radio"
          name="selection"
          checked={selectionType.includes("specific")}
          onChange={() => setSelectionType(["specific"])}
        />

        Apply only to specific products
      </label>

      <label style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="radio"
          name="selection"
          checked={selectionType.includes("all")}
          onChange={() => setSelectionType(["all"])}
        />

        Apply this discount to all products
      </label>

    </div>

  </s-box>
</s-section>

    {isSpecificSelected && (
      <SelectedProducts
        selectedProducts={selectedProducts}
        handleOpenPicker={handleOpenPicker}
      />
    )}
    <QuantityBreak
      value={quantityBreaks}
      onChange={setQuantityBreaks}
      onInit={handleInitBreaks} 
    />
    </div>
        {/* RIGHT SIDE (STICKY PREVIEW) */}
        <div style={{ flex: 1 }}>
      <WidgetPreview
        title={title}
        breaks={quantityBreaks}
        currency={currency}
      />
    </div>
    </div>
    </s-page>   
      );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};