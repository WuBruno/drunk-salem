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

export default function DrinksHistory() {
  const store = useStore(useAuthStore, (state) => state);
  const { data: drinks } = api.drinks.getDrinks.useQuery({
    gameId: store?.gameId || 0,
  });

  return (
    <Card className="w-[350px]">
      <ScrollArea className="h-72">
        <CardHeader>
          <CardTitle>Drinks History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drinks?.map((drink) => (
                <TableRow key={drink.id}>
                  <TableCell className="font-medium">{drink.day}</TableCell>
                  <TableCell className="font-medium">{drink.stage}</TableCell>
                  <TableCell className="font-medium">
                    {drink.target.username}
                  </TableCell>
                  <TableCell className="text-right">{drink.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
