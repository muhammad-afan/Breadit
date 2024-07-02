import { VoteType } from "@prisma/client";

export type CachedPost = {
  id: string;
  title: string;
  authorUsername: string;
  constent: string;
  currentVote: VoteType | null;
  createdAt: Date;
};
