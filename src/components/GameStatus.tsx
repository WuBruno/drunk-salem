import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useAuthStore } from "@/store";
import { api } from "@/utils/api";
import { useStore } from "zustand";
import { Button } from "./ui/button";

const GameStatus = () => {
  const store = useStore(useAuthStore, (state) => state);
  const game = api.game.one.useQuery(store?.gameId || 0);
  const nextStage = api.game.processNextStage.useMutation();

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Game Status</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="text-1xl">
          Day: <b>{game.data?.day}</b>
        </div>
        <div className="text-1xl">
          Stage: <b>{game.data?.stage}</b>
        </div>
        <div className="text-1xl">
          Code: <b>{game.data?.code}</b>
        </div>
        <Button
          onClick={() => {
            nextStage
              .mutateAsync({ gameId: game.data?.id || 0 })
              .then(() => game.refetch())
              .catch(console.error);
          }}
        >
          Next Stage
        </Button>
      </CardContent>
    </Card>
  );
};

export default GameStatus;
