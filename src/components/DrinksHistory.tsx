import { useAuthStore } from "@/store";
import { useStore } from "zustand";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { api } from "@/utils/api";

export default function DrinksHistory() {
  const store = useStore(useAuthStore, (state) => state);
  const { data: drinks } = api.drinks.getDrinks.useQuery({
    gameId: store?.gameId || 0,
  });

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Drinks History</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-1">
        {drinks?.map((drink) => (
          <div key={drink.id}>
            Day {drink.day}-{drink.stage}: {drink.target.username} takes{" "}
            {drink.amount} drinks
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
