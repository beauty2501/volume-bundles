import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { useLoaderData } from "react-router";
import BundleList from "../components/BundleList";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const bundles = await prisma.bundle.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    bundles,
    hasBundle: bundles.length > 0,
    appEmbed: false,
    widgetAdded: false,
  };
};

export default function Dashboard() {

  const {
    bundles,
    hasBundle,
    appEmbed,
    widgetAdded,
  } = useLoaderData();

  return (
    <s-page heading="Bundler Dashboard">

      {/* Top Action */}
      <s-button slot="primary-action" href="/app/bundle">
        Create bundle
      </s-button>

      {/* Getting Started Card */}
      <s-section>
        <s-box padding="base" borderWidth="base" borderRadius="base">

          <s-heading>Get started with Bundler</s-heading>

          {/* Step 1 */}
          <s-box padding="base">
            <s-text>
              {hasBundle ? "✅" : "⚪"} Create your first bundle
            </s-text>
            {!hasBundle && (
              <>
                <br />
                <s-text tone="subdued">
                  Click below to create a quantity break bundle
                </s-text>
                <br /><br />
                <s-button href="/app/bundle">Create bundle</s-button>
              </>
            )}
          </s-box>

          {/* Step 2 */}
          <s-box padding="base">
            <s-text>
              {appEmbed ? "✅" : "⚪"} Enable app embed
            </s-text>
          </s-box>

          {/* Step 3 */}
          <s-box padding="base">
            <s-text>
              {widgetAdded ? "✅" : "⚪"} Add product page element
            </s-text>
          </s-box>

        </s-box>
      </s-section>
      {bundles.length > 0 && (
    <s-section>
      <BundleList bundles={bundles} />
    </s-section>
  )}

    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};