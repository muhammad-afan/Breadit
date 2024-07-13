import { getAuthSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AdminManagement from "@/components/AdminManagement";

interface PageProps {
  params: {
    slug: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { slug } = params;

  const session = await getAuthSession();
  if (!session?.user) return notFound();

  const users = await db.subscription.findMany({
    where: {
      subreddit: {
        name: slug,
      },
    },
    include: {
      user: true,
    },
  });

  const filteredUsers = users
    .filter((user) => user.userId !== session?.user?.id)
    .sort((a, b) => (a.user.name || "").localeCompare(b.user.name || ""));

  return (
    // <></>
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminManagement users={filteredUsers} subreddit={slug} />
      <div className="flex justify-center mt-6"></div>
    </div>
  );
};

export default Page;
