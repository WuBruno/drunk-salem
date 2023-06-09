import { useAuthStore, useStore } from "@/store";
import { useRouter } from "next/router";
import { Button } from "./ui/button";

const Navbar = () => {
  const state = useStore(useAuthStore, (state) => state);
  const router = useRouter();

  return (
    <nav className="flex flex-wrap items-center justify-between bg-slate-500 p-6">
      <div className="mr-6 flex flex-shrink-0 items-center text-white">
        <span className="text-xl font-semibold tracking-tight">
          Drunk Mafia
        </span>
      </div>
      <div className="flex gap-3">
        <Button
          variant="link"
          className="text-white"
          size="sm"
          onClick={() => {
            router.replace("/admin").catch(console.error);
          }}
        >
          Admin
        </Button>
        {state?.userId && (
          <>
            <Button
              variant="link"
              className="text-white"
              size="sm"
              onClick={() => {
                router.replace("/game").catch(console.error);
              }}
            >
              Game
            </Button>
            <Button
              onClick={() => {
                router.replace("/").catch(console.error);
                state?.signOut();
              }}
              variant="outline"
              className="text-white"
              size="sm"
            >
              Sign out: {state?.username}
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
