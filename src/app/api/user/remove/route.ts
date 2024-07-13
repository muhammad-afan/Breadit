import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const subredditId = url.searchParams.get("subredditId");

  if (!userId || !subredditId)
    return new Response("Missing parameters", { status: 400 });

  const session = await getAuthSession();

  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  try {
    // Remove user from database
    await db.subscription.delete({
      where: {
        userId_subredditId: {
          userId,
          subredditId,
        },
      },
    });

    return new Response("User deleted", { status: 200 });
  } catch (e) {
    return new Response("Something went wrong", { status: 500 });
  }
}
