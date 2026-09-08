import { useAppBridge } from "@shopify/app-bridge-react";

export default function useProductPicker() {
    const app = useAppBridge();

    const openPicker = async () => {
      const result = await app.resourcePicker({
        type: "product",
        multiple: true,
      });
 
      if (result?.selection?.length) {
        return result.selection;
      }
  
      return [];
    };
  
    return openPicker;
}   