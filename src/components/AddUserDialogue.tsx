import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserDialogProps {
  subreddit: string;
}

export function UserDialog({ subreddit }: UserDialogProps) {
  const [input, setInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { loginToast } = useCustomToast();
  const router = useRouter();
  const { mutate: addUser, isLoading } = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const payload = { name, subreddit };

      const { data } = await axios.post("/api/user/add", payload);
      return data;
    },
    onError: (error) => {
      setIsOpen(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) return loginToast();
        if (error.response?.status === 404) {
          return toast({
            title: "User not exists",
            description: "User with this username doesn't exist",
            variant: "destructive",
          });
        }
        if (error.response?.status === 403) {
          return toast({
            title: "Not allowed",
            description: "You are not allowed to perform this action",
            variant: "destructive",
          });
        }
        if (error.response?.status === 409) {
          return toast({
            title: "Already subscribed",
            description: "User has already subscribed this subreddit",
            variant: "destructive",
          });
        }
      }
    },
    onSuccess: () => {
      setInput("");
      setIsOpen(false);
      router.refresh();
      return toast({
        title: "User added",
        description: `User has been added to ${subreddit}`,
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"} onClick={() => setIsOpen(true)}>
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Enter username to add users to {subreddit}
          </DialogDescription>
        </DialogHeader>
        <div className="relative grid gap-1">
          <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
            <span className="text-small text-zinc-400">u/</span>
          </div>
          <div className="flex flex-col justify-start gap-4 items-start">
            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="col-span-3 pl-6"
              size={32}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            isLoading={isLoading}
            disabled={input.length < 3 || isLoading}
            onClick={() => addUser({ name: input })}
            type="submit"
          >
            {isLoading ? "Adding User" : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
