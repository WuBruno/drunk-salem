/* eslint-disable @typescript-eslint/no-misused-promises */
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store";
import { api } from "@/utils/api";
import { useStore } from "zustand";

const FormSchema = z.object({
  target: z.string(),
});

function Investigator() {
  const store = useStore(useAuthStore, (state) => state);
  const targets = api.user.alive.useQuery(store?.gameId || 0);
  const myInvestigation = api.actions.getInvestigate.useQuery({
    gameId: store?.gameId || 0,
  });

  const { mutate: investigate } = api.actions.investigate.useMutation({
    onError: (err) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
    onSuccess: () => {
      form.reset();
      toast({
        title: "Investigation Target Update",
      });
    },
  });
  const { mutate: clearInvestigation } =
    api.actions.removeInvestigate.useMutation({
      onError: (err) =>
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        }),
      onSuccess: () => {
        form.reset();
        toast({
          title: "Investigation Update to no one",
        });
      },
    });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (data.target === "0") {
      clearInvestigation({
        gameId: store.gameId || 0,
      });
    } else {
      investigate({
        targetId: Number(data.target),
        gameId: store?.gameId || 0,
        userId: store?.userId || 0,
      });
    }
  }

  if (myInvestigation.isLoading) {
    return <></>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Target:</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={myInvestigation.data?.targetId.toString() || "0"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem key={0} value={"0"}>
                    No one
                  </SelectItem>
                  {targets.data
                    ?.filter((user) => user.id !== store.userId)
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={!form.formState.isDirty}>
          Update
        </Button>
      </form>
    </Form>
  );
}

const DetectiveForm = () => {
  const store = useStore(useAuthStore, (state) => state);
  const { data: results } = api.actions.getInvestigationResults.useQuery({
    gameId: store?.gameId || 0,
  });

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Detective Choose to Investigate</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Investigator />
        {results?.map((result) => (
          <div key={result.id}>
            <p className="text-lg">{result.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DetectiveForm;
