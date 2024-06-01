import Button from "./ui/Button";
import Card from "./ui/Card";
import Footer from "./ui/Footer";
import Header from "./ui/Header";
import Textarea from "./ui/Textarea";

export default function Connect({
  error,
  isLoading,
  connectAction,
}: {
  isLoading: boolean;
  error: string | undefined;
  connectAction: (data: FormData) => void;
}) {
  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen w-screen p-4">
      <Header className="w-[400px] max-w-screen" />
      <Card
        as="form"
        action={connectAction}
        className="w-[400px] max-w-screen shadow-xl"
      >
        <h1 className="text-3xl">Connect to Azure</h1>
        <p className="text-sm text-gray-500">
          The app requires a valid <code>ConnectionString</code> to a Azure App
          Configuration instance to work. It can be found in{" "}
          <code>Access settings</code> of your App Configuration.
        </p>

        <Textarea
          label="Connection String"
          name="connectionString"
          placeholder="Endpoint=...;Id=...;Secret=..."
          rows={5}
          required
          helpText="The ConnectionString will not be saved anywhere and only used for your session in your device."
          defaultValue={import.meta.env["VITE_AZURE_CONNECTION_STRING"]}
        />

        <Button disabled={isLoading} className="justify-center">
          {isLoading ? "Connecting..." : "Connect to Azure"}
        </Button>

        {error ? <p className="text-red-500">{error}</p> : null}
      </Card>
      <Footer className="w-[400px] max-w-screen " />
    </div>
  );
}
