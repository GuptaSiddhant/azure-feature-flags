import useHashChange from "./hooks/useHashChange";
import Card from "./ui/Card";

export default function Flag() {
  const flagId = useHashChange();

  return (
    <main className="flex-1 md:row-[1_/_-1] md:col-[2]">
      <Card className="h-full">{flagId}</Card>
    </main>
  );
}
