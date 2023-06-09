/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStore } from "zustand";
import { useAuthStore } from "@/store";

export const adminSignupForm = z.object({
  pass: z.string(),
});

export type AdminSigninFormProps = {
  onSubmit: (values: z.infer<typeof adminSignupForm>) => void;
};

export default function AdminSigninForm() {
  const store = useStore(useAuthStore, (state) => state);
  // 1. Define your form.
  const form = useForm<z.infer<typeof adminSignupForm>>({
    resolver: zodResolver(adminSignupForm),
    defaultValues: {
      pass: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof adminSignupForm>) => {
    if (values.pass === "drunkmafiaisfun") {
      store.joinAsAdmin();
    }
    form.setError("pass", {
      message: "Incorrect password",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="pass"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Password</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="float-right">
          Signin
        </Button>
      </form>
    </Form>
  );
}
