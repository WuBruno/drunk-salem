import { type NextPage } from "next";
import Head from "next/head";
import { useAuthStore, useStore } from "@/store";
import { api } from "@/utils/api";
import { Button } from "../components/ui/button";
import RegisterUserForm from "../components/RegisterUserForm";
import { Separator } from "../components/ui/separator";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { GAME_STATES } from "@/constants";
import { toast } from "@/components/ui/use-toast";

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
    onSuccess: (data) => signIn(data.username, data.id),
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
      return ctx.game.all.invalidate();
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });
  const { mutate: handleStartGame } = api.game.startGame.useMutation({
    onSuccess: () => ctx.game.all.invalidate(),
    onError: (err) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
  });

  const router = useRouter();

  useEffect(() => {
    if (store?.userId && game.data?.state === GAME_STATES.RUNNING) {
      router.replace("/game").catch(console.error);
    }
  }, [game.data?.state, router, store?.userId]);

  return (
    <>
      <Head>
        <title>Drunk Salem</title>
        <meta name="description" content="Drunk Salem Game" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 ">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Drunk Salem
          </h1>
          {!store?.gameId ? (
            <>
              {games && (
                <div className="flex flex-col gap-2">
                  Join existing game:
                  {games.data?.map((game) => (
                    <Button
                      key={game.id}
                      variant="outline"
                      onClick={() => joinGame(game.id, game.code)}
                    >
                      {game.code}
                    </Button>
                  ))}
                </div>
              )}
              <Button onClick={() => handleCreateGame()}>
                Create New Game
              </Button>
            </>
          ) : (
            <p>Joined game: {store.gameCode}</p>
          )}
          {store?.gameId &&
            (!store.userId ? (
              <div className="flex flex-col gap-5">
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
                <div className="flex flex-col gap-3">
                  <p>Or sign in as existing user:</p>
                  {users.data?.map((user) => (
                    <Button
                      key={user.id}
                      variant="outline"
                      onClick={() => signIn(user.username, user.id)}
                    >
                      {user.username}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p>Signed in as: {store?.username}</p>
            ))}
          {store?.gameId && store?.userId && (
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
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
