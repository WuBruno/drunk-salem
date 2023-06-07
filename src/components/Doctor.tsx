/* eslint-disable @typescript-eslint/no-misused-promises */
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/store";
import { useStore } from "zustand";
import { api } from "@/utils/api";

const FormSchema = z.object({
  target: z.string(),
});

function HealTarget() {
  const store = useStore(useAuthStore, (state) => state);
  const targets = api.user.alive.useQuery(store?.gameId || 0);
  const myHeal = api.actions.getHeal.useQuery({
    gameId: store?.gameId || 0,
  });
  const { mutate: heal } = api.actions.heal.useMutation({
    onError: (err) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
    onSuccess: () => {
      form.reset();
      toast({
        title: "Heal Update",
      });
    },
  });
  const { mutate: clearHeal } = api.actions.removeHeal.useMutation({
    onError: (err) =>
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      }),
    onSuccess: () => {
      form.reset();
      toast({
        title: "Heal Update to no one",
      });
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (data.target === "0") {
      clearHeal({
        gameId: store.gameId || 0,
      });
    } else {
      heal({
        targetId: Number(data.target),
        gameId: store?.gameId || 0,
        userId: store?.userId || 0,
      });
    }
  }

  if (myHeal.isLoading) {
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
                defaultValue={myHeal.data?.targetId.toString() || "0"}
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
                  {targets.data?.map((user) => (
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

const DoctorForm = () => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Doctor Choose to Heal</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <HealTarget />
      </CardContent>
    </Card>
  );
};

export default DoctorForm;
