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

export default function PublicPlayers() {
  const store = useStore(useAuthStore, (state) => state);
  const { data: roles } = api.user.roles.useQuery(store?.gameId || 0);

  return (
    <Card className="w-[350px]">
      <Collapsible>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Roles
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
            {roles?.map((role) => (
              <p key={role.roleId} className="capitalize">
                {role.roleId.toLocaleLowerCase()} - {role._count.id}
              </p>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
