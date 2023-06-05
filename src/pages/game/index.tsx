import { useAuthStore } from "@/store";
import { api } from "@/utils/api";
import { type NextPage } from "next";
import { useStore } from "zustand";
import GameStatus from "../components/GameStatus";
import VoteUser from "../components/VoteUser";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/pages/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";

const Main: NextPage = () => {
  const store = useStore(useAuthStore, (state) => state);
  const users = api.user.alive.useQuery(store?.gameId || 0);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-7 px-4 py-16 ">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Drunk Salem
          </h1>
          <Tabs defaultValue="current" className="w-[380px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="password">History</TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="flex flex-col gap-7">
              <GameStatus />
              <Card className="w-[380px]">
                <CardHeader>
                  <CardTitle>Players Alive</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {users.data?.map((user) => (
                    <p key={user.id}>{user.username}</p>
                  ))}
                </CardContent>
              </Card>
              <VoteUser />
            </TabsContent>
            <TabsContent value="votes">Change your password here.</TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default Main;
