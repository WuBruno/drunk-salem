import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { api } from "@/utils/api";
import { Separator } from "./ui/separator";

export default function UserList({ gameId }: { gameId: number }) {
  const users = api.user.allUsers.useQuery(gameId);

  return (
    <Card className="w-[250px]">
      <CardHeader>
        <CardTitle>Users in Game</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-1">
        {users.data?.map((user) => (
          <div key={user.id}>{user.username}</div>
        ))}
        <Separator />
        <div>Total: {users.data?.length}</div>
      </CardContent>
    </Card>
  );
}
