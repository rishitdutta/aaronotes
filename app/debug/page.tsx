export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <p>If you can see this page, Next.js routing is working!</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}
