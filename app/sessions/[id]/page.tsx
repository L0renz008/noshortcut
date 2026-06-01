export default async function SessionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return (
    <div className="p-4">
      <p>Session : {id}</p>
    </div>
  );
}
