import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  let followedCommunitiesIds: string[] = [];

  if (session) {
    const followedCommunities = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subreddit: true,
      },
    });

    followedCommunitiesIds = followedCommunities.map((sub) => sub.subreddit.id);

    try {
      const { limit, page, subredditName } = z
        .object({
          limit: z.string(),
          page: z.string(),
          subredditName: z.string().nullish().optional(),
        })
        .parse({
          subredditName: url.searchParams.get("subredditName"),
          limit: url.searchParams.get("limit"),
          page: url.searchParams.get("page"),
        });

      let whereClause = {};

      if (subredditName) {
        whereClause = {
          subreddit: {
            name: subredditName,
          },
        };
      } else if (session) {
        whereClause = {
          subreddit: {
            id: {
              in: followedCommunitiesIds,
            },
          },
        };
      }

      const posts = await db.post.findMany({
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        orderBy: {
          createdAt: "desc",
        },
        include: {
          subreddit: true,
          votes: true,
          author: true,
          comments: true,
        },
        where: whereClause,
      });

      return new Response(JSON.stringify(posts));
    } catch (e) {
      if (e instanceof z.ZodError) {
        return new Response("Invalid request data passed", { status: 422 });
      }

      return new Response("Could not fetch more posts", {
        status: 500,
      });
    }
  } else {
    try {
      const { limit, page, subredditName } = z
        .object({
          limit: z.string(),
          page: z.string(),
          subredditName: z.string().nullish().optional(),
        })
        .parse({
          limit: url.searchParams.get("limit"),
          page: url.searchParams.get("page"),
          subredditName: url.searchParams.get("subredditName"),
        });

      let whereClause = {};

      if (subredditName) {
        whereClause = {
          subreddit: {
            name: subredditName,
          },
        };
      }

      const posts = await db.post.findMany({
        where: whereClause,
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        orderBy: {
          createdAt: "desc",
        },
        include: {
          votes: true,
          author: true,
          comments: true,
          subreddit: true,
        },
      });

      return new Response(JSON.stringify(posts));
    } catch (e) {
      if (e instanceof z.ZodError) {
        return new Response("Invalid request data passed", { status: 422 });
      }

      return new Response("Could not fetch more posts", {
        status: 500,
      });
    }
  }
}
