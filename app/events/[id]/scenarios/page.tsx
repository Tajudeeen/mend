import Workspace from "@/app/workspace";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Workspace eventId={id} initialView="repair" />;
}
