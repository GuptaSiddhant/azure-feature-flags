import { useReducer } from "react";
import Button from "./ui/Button";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import FlagPage from "./FlagPage/index.tsx";
import SideBar from "./Sidebar.tsx";
import { useFeatureFlags } from "./hooks/useFeatureFlag.ts";
import { RerenderAppContext } from "./contexts.ts";

export default function App({
  disconnectAction,
}: {
  disconnectAction: (data: FormData) => void;
}) {
  const [seed, refresh] = useReducer((prev) => prev + 1, 0);
  const featureFlags = useFeatureFlags(seed);

  return (
    <RerenderAppContext.Provider value={refresh}>
      <div className="flex flex-col md:grid md:grid-cols-[300px_1fr] md:grid-rows-[max-content_1fr_max-content] gap-4 justify-center md:h-screen w-screen p-4">
        <Header />

        <SideBar featureFlags={featureFlags} />

        <FlagPage />

        <Footer className="col-[1]">
          <form action={disconnectAction} className="flex">
            <Button className="text-red-500 w-full justify-center">
              Disconnect from Azure
            </Button>
          </form>
        </Footer>
      </div>
    </RerenderAppContext.Provider>
  );
}
