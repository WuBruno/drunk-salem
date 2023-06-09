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

const EventHistory = () => {
  const store = useStore(useAuthStore, (state) => state);
  const { data: events } = api.events.all.useQuery(store?.gameId || 0);

  return (
    <Card className="w-[350px]">
      <ScrollArea className="h-72 ">
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.day}</TableCell>
                  <TableCell className="font-medium">{event.stage}</TableCell>
                  <TableCell className="text-right">
                    {event.description}
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

export default EventHistory;
