import { useAuthStore } from "@/store";
import { useStore } from "zustand";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { api } from "@/utils/api";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";

const VoteHistoryDay = ({ day }: { day: number }) => {
  const store = useStore(useAuthStore, (state) => state);
  const userVotes = api.vote.getVotesByDay.useQuery({
    gameId: store?.gameId || 0,
    day,
  });

  return (
    <AccordionItem value={day.toString()}>
      <AccordionTrigger>Day {day}</AccordionTrigger>
      <AccordionContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voter</TableHead>
              <TableHead className="text-right">Vote</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userVotes.data?.map((userVotes) => (
              <TableRow key={userVotes.id}>
                <TableCell className="font-medium">
                  {userVotes.username}
                </TableCell>
                <TableCell className="text-right">
                  {userVotes.votes.flatMap((vote) => vote.target.username)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionContent>
    </AccordionItem>
  );
};

const VoteHistory = () => {
  const store = useStore(useAuthStore, (state) => state);
  const game = api.game.one.useQuery(store?.gameId || 0);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Daily Votes</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Accordion type="single" collapsible>
          {game.data?.day &&
            Array.from({ length: game.data?.day - 1 }, (_, i) => i + 1).map(
              (day) => <VoteHistoryDay key={day} day={day} />
            )}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default VoteHistory;
