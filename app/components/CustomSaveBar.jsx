import { SaveBar } from "@shopify/app-bridge-react";
import { useEffect } from "react";

export default function CustomSaveBar({ isDirty, onSave, onDiscard }) {

  useEffect(() => {
    if (!window.shopify) return;

    if (isDirty) {
      window.shopify.saveBar.show("bundle-save-bar");
    } else {
      window.shopify.saveBar.hide("bundle-save-bar");
    }
  }, [isDirty]);

  return (
    <SaveBar id="bundle-save-bar">
      <button variant="primary" onClick={onSave}>
        Save
      </button>
      <button onClick={onDiscard}>
        Discard
      </button>
    </SaveBar>
  );
}