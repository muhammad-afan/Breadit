"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Trash } from "lucide-react";
import { Button } from "./ui/Button";
import { Subscription, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { UserDialog } from "./AddUserDialogue";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./ui/Pagination";

interface AdminManagementProps {
  users: (Subscription & {
    user: User;
  })[];
  subreddit: string;
}

type RemoveUserPayload = {
  userId: string;
  subredditId: string;
};

const AdminManagement = ({ users, subreddit }: AdminManagementProps) => {
  const rowsPerPage = 5;
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(rowsPerPage);

  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const router = useRouter();
  const { mutate: removeUser, isLoading } = useMutation({
    mutationFn: async ({ userId, subredditId }: RemoveUserPayload) => {
      console.log("🚀 ~ mutationFn: ~ userId:", userId);
      const { data } = await axios.delete(`/api/user/remove`, {
        params: { userId: userId, subredditId },
      });
      return data;
    },
    onSuccess: () => {
      setLoadingUserId(null);
      router.refresh();
      toast({
        title: "User removed",
        description: "User has been successfully removed",
      });
    },
    onError: (err) => {
      console.log(err);
      setLoadingUserId(null);
      return toast({
        title: "Something went wrong",
        description: "User could not be removed",
        variant: "destructive",
      });
    },
  });

  const handleRemoveUser = (userId: string, subredditId: string) => {
    setLoadingUserId(userId);
    removeUser({ userId, subredditId });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <UserDialog subreddit={subreddit} />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.slice(startIndex, endIndex).map((user) => (
              <TableRow key={user.userId}>
                <TableCell>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.user.image || ""} />
                    <AvatarFallback>
                      {user.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{user.user.username}</TableCell>
                <TableCell>{user.user.name}</TableCell>
                <TableCell>
                  <Button
                    isLoading={loadingUserId === user.user.id}
                    disabled={loadingUserId !== null}
                    variant={"destructive"}
                    size={"sm"}
                    onClick={() =>
                      handleRemoveUser(user.user.id, user.subredditId)
                    }
                  >
                    {loadingUserId === user.user.id ? null : (
                      <Trash className="h-4 w-4 mr-2" />
                    )}
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination className="mt-3">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className={
                  startIndex <= 0
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
                onClick={() => {
                  setStartIndex(startIndex - rowsPerPage);
                  setEndIndex(endIndex - rowsPerPage);
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                className={
                  endIndex >= users.length
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
                onClick={() => {
                  setStartIndex(startIndex + rowsPerPage);
                  setEndIndex(endIndex + rowsPerPage);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default AdminManagement;
