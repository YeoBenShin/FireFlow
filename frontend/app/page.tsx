import { MainLayout } from "./_components/layout/main-layout"
import { ProgressBar } from "./_components/progress-bar"
import { ExpenseCard } from "./_components/expense-card"
import { MonthlyBreakdown } from "./_components/monthly-breakdown"
import { GoalsSection } from "./_components/goals-section"
import { RecentTransactions } from "./_components/recent-transactions"

export default function HomePage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

        {/* Progress Bar */}
        <ProgressBar current={50} total={200} max={250} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <ExpenseCard amount={1187.4} title="Day's Expenses" />
            <MonthlyBreakdown />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <GoalsSection />
            <RecentTransactions />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
