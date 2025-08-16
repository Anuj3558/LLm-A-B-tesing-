import { Skeleton } from "antd"

export const AdminDashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Header Skeleton */}
      <Skeleton.Input active className="!h-28 !w-full" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} active paragraph={{ rows: 3 }} />
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} active paragraph={{ rows: 6 }} />
        ))}
      </div>
    </div>
  )
}