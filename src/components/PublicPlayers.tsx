import { ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./ui/collapsible";
import { useAuthStore } from "@/store";
import { api } from "@/utils/api";
import { useStore } from "zustand";
import { Separator } from "./ui/separator";

export default function PublicPlayers() {
  const store = useStore(useAuthStore, (state) => state);
  const users = api.user.allUsers.useQuery(store?.gameId || 0);
  const playersAlive = users.data?.filter((user) => user.alive);
  const playersDead = users.data?.filter((user) => !user.alive);

  return (
    <Card className="w-[350px]">
      <Collapsible>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Players
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </CardTitle>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="grid gap-4">
            <h3 className="text-l scroll-m-20 font-semibold tracking-tight">
              Alive:
            </h3>
            {playersAlive?.map((user) => (
              <p key={user.id}>{user.username}</p>
            ))}
            total alive: {playersAlive?.length}
            <Separator />
            <h3 className="text-l scroll-m-20 font-semibold tracking-tight">
              Dead:
            </h3>
            {playersDead?.map((user) => (
              <p key={user.id}>{user.username}</p>
            ))}
            total dead: {playersDead?.length}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
