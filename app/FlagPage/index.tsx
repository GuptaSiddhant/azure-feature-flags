import useHashChange from "../hooks/useHashChange";
import Card from "../ui/Card";
import { useFeatureFlag } from "../hooks/useFeatureFlag";
import { useReducer } from "react";
import { deleteFeatureFlag } from "../../src";
import { NEW_FLAG_HASH } from "../constants";
import { useAzureClientContext, useRerenderAppContext } from "../contexts";

export default function FlagPage() {
  const flagId = useHashChange();
  const [seed, refresh] = useReducer((prev) => prev + 1, 0);
  const featureFlag = useFeatureFlag(flagId, seed);
  const isNew = flagId === NEW_FLAG_HASH;

  return (
    <>
      <Card className="md:row-[1] md:col-[2] flex-row justify-between">
        <span className="font-bold">
          {isNew ? "New Feature Flag" : flagId || "No flag selected"}
        </span>

        {!flagId || isNew ? null : (
          <div className="flex gap-4 justify-end">
            <DeleteButton flagId={flagId} />
            <button type="button" className="cursor-pointer" onClick={refresh}>
              Refresh
            </button>
          </div>
        )}
      </Card>

      {/* <Card className="flex-1 md:row-[2] md:col-[2] h-full overflow-y-scroll">
        <pre>{JSON.stringify(featureFlag, null, 2)}</pre>
      </Card> */}

      <Card className="md:row-[2_/_-1] md:col-[2] h-full overflow-y-scroll">
        {featureFlag ? (
          <pre className="overflow-y-scroll text-sm">
            {JSON.stringify(featureFlag, null, 2)}
          </pre>
        ) : (
          <span className="text-gray-500">
            JSON representation of the Feature Flag
          </span>
        )}
      </Card>
    </>
  );
}

function DeleteButton({ flagId }: { flagId: string }) {
  const client = useAzureClientContext();
  const refreshApp = useRerenderAppContext();

  return (
    <button
      type="button"
      className="cursor-pointer text-red-500"
      onClick={() => {
        if (confirm(`Are you sure to delete Feature Flag '${flagId}'?`)) {
          deleteFeatureFlag(client, flagId).then(() => {
            window.location.hash = "";
            refreshApp();
          });
        }
      }}
    >
      - Delete
    </button>
  );
}
