import { currentUser } from "@clerk/nextjs/server";

export default async function TestPage() {
  const user = await currentUser();

  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div className="p-4">
      <h1>Test Page</h1>
      <p>User ID: {user.id}</p>
      <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
      <p>First Name: {user.firstName}</p>
      <p>Last Name: {user.lastName}</p>
    </div>
  );
}
