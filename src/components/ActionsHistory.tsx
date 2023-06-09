import { useAuthStore } from "@/store";
import { useStore } from "zustand";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { api } from "@/utils/api";
import { ScrollArea } from "./ui/scroll-area";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";

const ActionsHistory = () => {
  const store = useStore(useAuthStore, (state) => state);
  const { data: actions } = api.actions.all.useQuery({
    gameId: store?.gameId || 0,
  });

  return (
    <Card className="w-[350px]">
      <ScrollArea className="h-72 ">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions?.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="font-medium">{action.day}</TableCell>
                  <TableCell className="font-medium">{action.stage}</TableCell>
                  <TableCell className="font-medium">{action.type}</TableCell>
                  <TableCell className="font-medium">
                    {action.user.username}
                  </TableCell>
                  <TableCell className="text-right">
                    {action.target.username}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default ActionsHistory;
