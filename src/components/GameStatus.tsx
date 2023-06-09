import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useAuthStore } from "@/store";
import { api } from "@/utils/api";
import { useStore } from "zustand";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

const GameStatus = () => {
  const store = useStore(useAuthStore, (state) => state);
  const game = api.game.one.useQuery(store?.gameId || 0);
  const { data: user } = api.user.user.useQuery(store?.userId || 0);
  const ctx = api.useContext();
  const { mutate: processNextStage } = api.game.processNextStage.useMutation({
    onSuccess: async () => {
      toast({ title: "Success", description: "Next stage processed" });
      return ctx.game.one.invalidate();
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

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
        <div className="text-1xl">
          Username: <b>{user?.username}</b>
        </div>
        <div className="text-1xl">
          Role:{" "}
          <b>
            {user?.role.role} - {user?.role.team}
          </b>
        </div>
        {store.isAdmin && (
          <Button
            onClick={() => processNextStage({ gameId: game.data?.id || 0 })}
          >
            Next Stage
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default GameStatus;
