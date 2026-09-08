import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    {
      shop {
        currencyCode
      }
    }
  `);

  const data = await response.json();

  return Response.json({
    currency: data.data.shop.currencyCode,
  });
}