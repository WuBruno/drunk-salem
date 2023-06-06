import { useAuthStore } from "@/store";
import { useStore } from "zustand";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { api } from "@/utils/api";

const EventHistory = () => {
  const store = useStore(useAuthStore, (state) => state);
  const events = api.events.all.useQuery(store?.gameId || 0);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Events</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {events?.data?.map((event) => (
          <p key={event.id} className="capitalize">
            Day {event.day}-{event.stage.toLowerCase()}: {event.description}
          </p>
        ))}
      </CardContent>
    </Card>
  );
};

export default EventHistory;
