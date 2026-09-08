import { json } from "@remix-run/node";
import { useLoaderData } from "react-router";

import prisma from "../db.server";

import BundlePage from "../components/BundlePage";

export const loader = async ({ request, params }) => {
  const url = new URL(request.url);

  const requestedMode = url.searchParams.get("mode");
  const mode = requestedMode || (params.id ? "edit" : "create");

  const bundle = await prisma.bundle.findUnique({
    where: {
      id: Number(params.id),
    },
  });

  return json({
    bundle,
    mode,
  });
};

export default function BundleEditPage() {
  
 const data = useLoaderData();

  return <BundlePage loaderData={data} />;
}