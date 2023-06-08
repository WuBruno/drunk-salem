import { useAuthStore } from "@/store";
import { api } from "@/utils/api";
import { type NextPage } from "next";
import { useStore } from "zustand";
import GameStatus from "../../components/GameStatus";
import VoteUser from "../../components/VoteUser";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import VoteHistory from "../../components/VoteHistory";
import EventHistory from "../../components/EventHistory";
import MafiaTargetForm from "@/components/MafiaKill";
import { DayStage, Role } from "@prisma/client";
import DoctorForm from "@/components/Doctor";
import DetectiveForm from "@/components/Detective";
import DrinksHistory from "@/components/DrinksHistory";

const Main: NextPage = () => {
  const store = useStore(useAuthStore, (state) => state);
  const users = api.user.alive.useQuery(store?.gameId || 0);
  const user = api.user.user.useQuery(store?.userId || 0);
  const game = api.game.one.useQuery(store?.gameId || 0);

  return (
    <div className="container flex flex-col items-center gap-7 px-4 py-10 ">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Drunk Salem
      </h1>
      <Tabs defaultValue="current" className="w-[350px]">
        <TabsList className="mb-7 grid w-full grid-cols-2">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="votes">History</TabsTrigger>
        </TabsList>
        <TabsContent value="current" className="flex flex-col gap-7">
          <GameStatus />
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Players Alive</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {users.data?.map((user) => (
                <p key={user.id}>
                  {user.username} - {user.roleId?.toLowerCase()}
                </p>
              ))}
            </CardContent>
          </Card>
          {game.data?.stage !== DayStage.NIGHT && <VoteUser />}
          {user.data?.roleId === Role.MAFIA_KILLING && <MafiaTargetForm />}
          {user.data?.roleId === Role.DOCTOR && <DoctorForm />}
          {user.data?.roleId === Role.DETECTIVE && <DetectiveForm />}
          <EventHistory />
          <DrinksHistory />
        </TabsContent>
        <TabsContent value="votes">
          <VoteHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Main;
