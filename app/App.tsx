import { AppConfigurationClient } from "@azure/app-configuration";
import { useReducer } from "react";
import Button from "./ui/Button";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import Flag from "./Flag.tsx";
import SideBar from "./Sidebar.tsx";

export default function App(props: {
  client: AppConfigurationClient;
  disconnectAction: (data: FormData) => void;
}) {
  const [, rerender] = useReducer((prev) => prev + 1, 0);

  return (
    <div className="flex flex-col md:grid md:grid-cols-[300px_1fr] md:grid-rows-[max-content_1fr_max-content] gap-4 justify-center md:h-screen w-screen p-4">
      <Header>
        <Actions refresh={rerender} />
      </Header>

      <SideBar client={props.client} />

      <Flag />

      <Footer className="col-[1]">
        <form action={props.disconnectAction} className="flex">
          <Button className="text-red-500 w-full justify-center">
            Disconnect from Azure
          </Button>
        </form>
      </Footer>
    </div>
  );
}

function Actions({ refresh }: { refresh: () => void }) {
  return (
    <div className="flex gap-2 justify-between">
      <a className="cursor-pointer" href="#+new">
        + Add new
      </a>
      <button type="button" className="cursor-pointer" onClick={refresh}>
        Refresh
      </button>
    </div>
  );
}
