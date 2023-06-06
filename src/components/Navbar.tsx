import { useAuthStore, useStore } from "@/store";
import { useRouter } from "next/router";

const Navbar = () => {
  const state = useStore(useAuthStore, (state) => state);
  const router = useRouter();

  return (
    <nav className="flex flex-wrap items-center justify-between bg-slate-500 p-6">
      <div className="mr-6 flex flex-shrink-0 items-center text-white">
        <span className="text-xl font-semibold tracking-tight">
          Drunk Salem
        </span>
      </div>
      <div>
        {state?.userId && (
          <button
            onClick={() => {
              router.replace("/").catch(console.error);
              state?.signOut();
            }}
            className="mt-4 inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-slate-500 lg:mt-0"
          >
            Sign out: {state?.username}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
