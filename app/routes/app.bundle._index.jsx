import BundlePage from "../components/BundlePage";

export default function CreateBundlePage() {
  return (
    <BundlePage
      loaderData={{
        bundle: null,
        mode: "create",
      }}
    />
  );
}
