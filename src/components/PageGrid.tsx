export function PageGrid({
  main, sidebar,
}: { main: React.ReactNode; sidebar: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-content px-6">
      <div className="grid lg:grid-cols-[1fr_300px] gap-6 my-3.5 mb-10 items-start">
        <div>{main}</div>
        <aside>{sidebar}</aside>
      </div>
    </div>
  );
}
