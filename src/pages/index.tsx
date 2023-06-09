import { type NextPage } from "next";
import { useAuthStore, useStore } from "@/store";
import { api } from "@/utils/api";
import { Button } from "../components/ui/button";
import RegisterUserForm from "../components/RegisterUserForm";
import { Separator } from "../components/ui/separator";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "@/components/ui/use-toast";
import UserList from "@/components/UserList";
import { GameState } from "@prisma/client";

const Home: NextPage = () => {
  const [joinGame, signIn, signOut] = useAuthStore((state) => [
    state.joinGame,
    state.signIn,
    state.signOut,
  ]);
  const store = useStore(useAuthStore, (state) => state);

  const games = api.game.all.useQuery();
  const users = api.user.allUsers.useQuery(store?.gameId || 0);
  const game = api.game.one.useQuery(store?.gameId || 0);

  const ctx = api.useContext();

  const { mutate: registerUser } = api.user.signup.useMutation({
    onSuccess: async (data) => {
      toast({ title: "Joined Game", description: `Welcome ${data.username}` });
      signIn(data.username, data.id);
      return ctx.user.allUsers.invalidate(store?.gameId || 0);
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });
  const { mutate: handleCreateGame } = api.game.create.useMutation({
    onSuccess: (data) => {
      toast({ title: "New game created", description: `Code: ${data.code}` });
      joinGame(data.id, data.code);
      return ctx.game.all.refetch();
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });
  const { mutate: handleStartGame } = api.game.startGame.useMutation({
    onSuccess: () => {
      toast({ title: "Game started" });
      return ctx.game.invalidate();
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const router = useRouter();

  useEffect(() => {
    if (store?.userId && game.data?.state === GameState.RUNNING) {
      router.replace("/game").catch(console.error);
    }
  }, [game.data?.state, router, store?.userId]);

  return (
    <div className="container flex flex-col items-center justify-center gap-4 px-4 py-16 ">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Drunk Mafia
      </h1>
      {!store?.gameId ? (
        <div className="flex flex-col gap-2">
          {games.data && games.data.length > 0 && (
            <>
              Join existing game:
              {games.data?.map((game) => (
                <Button
                  key={game.id}
                  variant="outline"
                  onClick={() => joinGame(game.id, game.code)}
                >
                  <div className="capitalize">
                    {game.code} – {game.state.toLowerCase()}
                  </div>
                </Button>
              ))}
              <Separator />
            </>
          )}
          <Button onClick={() => handleCreateGame()}>Create New Game</Button>
        </div>
      ) : (
        <p>Joined game: {store.gameCode}</p>
      )}
      {(store?.gameId &&
        (!store.userId ? (
          <div className="flex flex-col gap-5">
            {game.data?.state === GameState.LOBBY && (
              <>
                <RegisterUserForm
                  onSubmit={({ username }) => {
                    store.gameId &&
                      registerUser({
                        username,
                        gameId: store.gameId,
                      });
                  }}
                />
                <Separator />
              </>
            )}
            <div className="flex flex-col gap-3">
              <p>Sign in as existing user:</p>
              {users.data?.map((user) => (
                <Button
                  key={user.id}
                  variant="outline"
                  onClick={() => signIn(user.username, user.id)}
                >
                  {user.username}
                </Button>
              ))}
              <Button variant="secondary" onClick={signOut}>
                Back
              </Button>
            </div>
          </div>
        ) : (
          <p>Signed in as: {store?.username}</p>
        ))) || <></>}
      {(store?.gameId && store?.userId && (
        <>
          <UserList gameId={store.gameId} />
          <div className="flex gap-3">
            <Button
              onClick={() =>
                store.gameId && handleStartGame({ gameId: store.gameId })
              }
            >
              Start Game
            </Button>
            <Button variant="destructive" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </>
      )) || <></>}
    </div>
  );
};

export default Home;
