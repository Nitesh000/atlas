import { dbClient, appSchema, authSchema } from "@atlas/database";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  let stats = { totalUsers: 0, totalOrgs: 0, totalWebsites: 0, totalApiCalls: 0, totalKeys: 0 };
  let recentOrgs: { id: string, name: string, plan: string, createdAt: Date }[] = [];
  let errorMsg = null;

  try {
    // Fetch stats concurrently
    const [
      [{ totalUsers }],
      [{ totalOrgs }],
      [{ totalWebsites }],
      [{ totalApiCalls }],
      [{ totalKeys }],
    ] = await Promise.all([
      dbClient.select({ totalUsers: sql<number>`count(*)` }).from(authSchema.user),
      dbClient.select({ totalOrgs: sql<number>`count(*)` }).from(appSchema.organization),
      dbClient.select({ totalWebsites: sql<number>`count(*)` }).from(appSchema.website),
      dbClient.select({ totalApiCalls: sql<number>`sum(api_call_count)` }).from(appSchema.apiUsage),
      dbClient.select({ totalKeys: sql<number>`count(*)` }).from(appSchema.apiKey),
    ]);

    stats = { totalUsers, totalOrgs, totalWebsites, totalApiCalls, totalKeys };

    // Fetch recent organizations
    recentOrgs = await dbClient
      .select({
        id: appSchema.organization.id,
        name: appSchema.organization.name,
        plan: appSchema.organization.plan,
        createdAt: appSchema.organization.createdAt,
      })
      .from(appSchema.organization)
      .orderBy(sql`created_at DESC`)
      .limit(10);
  } catch (err: unknown) {
    errorMsg = (err as Error).message;
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-8 flex items-center justify-center">
        <div className="text-center text-red-500 p-8 bg-red-50 rounded-xl border border-red-200">
          <h2 className="text-2xl font-bold mb-2">Database Connection Failed</h2>
          <p>Unable to load admin stats. {errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Atlas Superadmin</h1>
          <p className="mt-2 text-lg text-gray-600">
            System overview and aggregate metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} />
          <StatCard title="Organizations" value={stats.totalOrgs} />
          <StatCard title="Indexed Websites" value={stats.totalWebsites} />
          <StatCard title="API Keys" value={stats.totalKeys} />
          <StatCard title="Total API Calls" value={stats.totalApiCalls || 0} className="lg:col-span-4" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">Recent Organizations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{org.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{org.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 uppercase tracking-wider">
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentOrgs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No organizations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, className = "" }: { title: string; value: number | string; className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
      </div>
      <div className="mt-4">
        <span className="text-3xl font-bold text-gray-900">{Number(value).toLocaleString()}</span>
      </div>
    </div>
  );
}