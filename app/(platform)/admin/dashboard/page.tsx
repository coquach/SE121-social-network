import { DashboardActivity } from "./_components/activities";
import { DashboardAlerts } from "./_components/alerts";
import { DashboardEmotionOverview } from "./_components/emotions";
import { DashboardHeader } from "./_components/header";
import { DashboardStats } from "./_components/stats-card";


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardEmotionOverview />
        <DashboardActivity />
      </div>

      <DashboardAlerts />
    </div>
  );
}
