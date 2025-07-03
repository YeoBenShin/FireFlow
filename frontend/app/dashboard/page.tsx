// import React from "react";
// import { LoginForm } from "../_components/forms/login-form";

// export default function Login() {

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-100 to-teal-50 flex flex-col items-center justify-center p-8">
//       <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
//         <div className="px-8 py-10">
//           <h1 className="text-4xl font-bold text-center text-orange-600 mb-8">
//             Login
//           </h1>
//           <LoginForm />
//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Don’t have an account?{" "}
//               <a
//                 href="/sign-up"
//                 className="text-orange-500 hover:text-orange-600 font-medium"
//               >
//                 Sign up here
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { MainLayout } from "../_components/layout/main-layout"
import { ProgressBar } from "../_components/progress-bar"
import { ExpenseCard } from "../_components/expense-card"
import { MonthlyBreakdown } from "../_components/monthly-breakdown"
import { GoalsSection } from "../_components/goals-section"
import { RecentTransactions } from "../_components/recent-transactions"

export default function Dashboard() {
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