import { dbClient, appSchema, authSchema } from "@atlas/database";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  let stats = {
    totalUsers: 0,
    totalOrgs: 0,
    totalWebsites: 0,
    totalApiCalls: 0,
    totalKeys: 0,
  };
  let recentOrgs: {
    id: string;
    name: string;
    plan: string;
    createdAt: Date;
  }[] = [];
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
      dbClient
        .select({ totalUsers: sql<number>`count(*)` })
        .from(authSchema.user),
      dbClient
        .select({ totalOrgs: sql<number>`count(*)` })
        .from(appSchema.organization),
      dbClient
        .select({ totalWebsites: sql<number>`count(*)` })
        .from(appSchema.website),
      dbClient
        .select({ totalApiCalls: sql<number>`sum(api_call_count)` })
        .from(appSchema.apiUsage),
      dbClient
        .select({ totalKeys: sql<number>`count(*)` })
        .from(appSchema.apiKey),
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
      <div className="flex justify-center items-center p-8 min-h-screen bg-gray-50/50">
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
          <h2 className="mb-2 text-2xl font-bold">
            Database Connection Failed
          </h2>
          <p>Unable to load admin stats. {errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50/50">
      <div className="mx-auto space-y-8 max-w-7xl">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Atlas Superadmin
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            System overview and aggregate metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={stats.totalUsers} />
          <StatCard title="Organizations" value={stats.totalOrgs} />
          <StatCard title="Indexed Websites" value={stats.totalWebsites} />
          <StatCard title="API Keys" value={stats.totalKeys} />
          <StatCard
            title="Total API Calls"
            value={stats.totalApiCalls || 0}
            className="lg:col-span-4"
          />
        </div>

        <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="py-5 px-6 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Organizations
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="font-medium text-gray-500 bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Plan</th>
                  <th className="py-4 px-6">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrgs.map((org) => (
                  <tr
                    key={org.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-gray-500">
                      {org.id}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {org.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="py-1 px-2.5 text-xs font-medium tracking-wider text-blue-700 uppercase bg-blue-100 rounded-full">
                        {org.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentOrgs.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 px-6 text-center text-gray-500"
                    >
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

function StatCard({
  title,
  value,
  className = "",
}: {
  title: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between ${className}`}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500">{title}</span>
      </div>
      <div className="mt-4">
        <span className="text-3xl font-bold text-gray-900">
          {Number(value).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

