import { currentUser } from "@clerk/nextjs/server";

export default async function SimpleDashboard() {
  const user = await currentUser();

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Simple Dashboard</h1>
      <p>Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}!</p>
      <p>This is a simple dashboard without database calls.</p>
    </div>
  );
}
