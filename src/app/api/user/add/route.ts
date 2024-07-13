import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getAuthSession();

  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();

  const { name, subreddit } = body;

  if (!name || !subreddit)
    return new Response("Missing parameters", { status: 400 });

  try {
    const user = await db.user.findFirst({
      where: {
        username: name,
      },
    });

    if (!user)
      return new Response("User with this username doesn't exist", {
        status: 404,
      });

    const isAdmin = await db.subreddit.findFirst({
      where: {
        name: subreddit,
        creatorId: session.user.id,
      },
    });

    if (!isAdmin)
      return new Response("You are not allowed to perform this action", {
        status: 403,
      });

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subreddit: {
          name: subreddit,
        },
        user: {
          username: name,
        },
      },
    });

    if (subscriptionExists)
      return new Response(`User has already subscribed ${subreddit}`, {
        status: 409,
      });

    await db.subscription.create({
      data: {
        subreddit: {
          connect: {
            name: subreddit,
          },
        },
        user: {
          connect: {
            username: name,
          },
        },
      },
    });
    return new Response("User added", { status: 200 });
  } catch (e) {
    if (e instanceof Error) {
      return new Response(e.message, { status: 400 });
    }
    return new Response("Something went wrong", { status: 500 });
  }
}
