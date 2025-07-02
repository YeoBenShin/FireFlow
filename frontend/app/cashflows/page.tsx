"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "../_components/layout/main-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { LineChart } from "../_components/charts/line-chart";
import {
  Download,
  Info,
  Filter,
  Calendar,
  CalendarDays,
  CalendarRange,
  X,
} from "lucide-react";
import { AddExpenseForm } from "../_components/forms/add-expense-form";
import { AddIncomeForm } from "../_components/forms/add-income-form";
import { Sheet, SheetContent, SheetTrigger } from "@/app/_components/ui/sheet";
import { useIsMobile } from "../_hooks/use-mobile";
import { Transaction } from "@/../backend/models/transaction";
import { LineChartProps } from "../_components/charts/line-chart";
import { RecentTransactions } from "../_components/recent-transactions";
import type { LineChartProps as ChartProps } from "../_components/charts/line-chart";
import { addDays, startOfMonth, endOfMonth, format } from 'date-fns';

interface TransactionWithExtras extends Transaction {
  icon: JSX.Element;
  month: string;
}

function TransactionFilterForm({ onFilter, startDate, endDate, setStartDate, setEndDate }: { onFilter: (filters: any) => void, startDate: string, endDate: string, setStartDate: (d: string) => void, setEndDate: (d: string) => void }) {
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");

  // All categories from categoryIconMap, separated by type
  const expenseCategories = [
    "food",
    "transport",
    "medicine",
    "groceries",
    "rent",
    "gifts",
    "savings",
    "entertainment",
    "utilities",
    "shopping",
    "education",
    "other",
  ];
  const incomeCategories = [
    "salary",
    "freelance",
    "tutoring",
    "investment",
    "bonus",
    "rental",
    "business",
    "commission",
    "dividend",
    "gift",
  ];

  // Helper to build backend filter payload
  function buildFilterPayload() {
    const payload: any = {};
    if (type) payload.type = type;
    if (category) payload.category = [category];
    // Date range logic
    if (startDate && endDate) {
      payload.startDate = startDate;
      payload.endDate = endDate;
    } else if (startDate) {
      payload.dateDirection = "on";
      payload.dateTime = startDate;
    } else if (endDate) {
      payload.dateDirection = "on";
      payload.dateTime = endDate;
    }
    return payload;
  }

  return (
    <form
      className="flex flex-wrap gap-4 mb-4 items-end"
      onSubmit={e => {
        e.preventDefault();
        onFilter(buildFilterPayload());
      }}
    >
      <select value={type} onChange={e => setType(e.target.value)} className="border rounded p-2">
        <option value="">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <select value={category} onChange={e => setCategory(e.target.value)} className="border rounded p-2">
        <option value="">All Categories</option>
        <optgroup label="Expense Categories">
          {expenseCategories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </optgroup>
        <optgroup label="Income Categories">
          {incomeCategories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </optgroup>
      </select>
      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded p-2" placeholder="Start date" />
      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded p-2" placeholder="End date" />
      <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded">Filter</button>
      {(startDate || endDate) && (
        <button type="button" className="ml-2 text-orange-500 underline" onClick={() => { setStartDate(""); setEndDate(""); onFilter({}); }}>
          Clear Dates
        </button>
      )}
    </form>
  );
}

export default function CashflowsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [timeFilter, setTimeFilter] = useState<"Yearly" | "Monthly" | "Daily" | "Recent">("Monthly");
  const [chartData, setChartData] = useState<Record<string, ChartProps>>({});
  const [transactions, setTransactions] = useState<TransactionWithExtras[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [activeForm, setActiveForm] = useState<"expense" | "income" | null>(
    null
  );
  const isMobile = useIsMobile();
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithExtras[] | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Check URL parameters on component mount
  useEffect(() => {
    const openForm = searchParams.get("openForm");
    if (openForm === "expense") {
      setActiveForm("expense");
    } else if (openForm === "income") {
      setActiveForm("income");
    }
  }, [searchParams]);

  function getAllMonthsOfCurrentYear(): string[] {
    const now = new Date();
    const year = now.getFullYear();
    const months: string[] = [];

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const date = new Date(year, monthIndex);
      const monthStr = date.toLocaleString("en-GB", { month: "short" }); // Jan, Feb, etc.
      months.push(`${monthStr} ${year}`);
    }

    return months;
  }

  function getAllDaysOfCurrentMonth(): string[] {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Get last day of this month
    const lastDay = new Date(year, month + 1, 0).getDate();

    const days: string[] = [];

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day);
      const dayStr = date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      days.push(dayStr);
    }

    return days;
  }

  useEffect(() => {
    // Fetch recent transactions from the backend
    const fetchData = async () => {
      const res = await fetch("http://localhost:5100/api/transactions", {
        credentials: "include",
      });
      const data: TransactionWithExtras[] = await res.json();

      // Replace icon string with JSX component
      const withIcons = data.map((tx: TransactionWithExtras) => ({
        ...tx,
        dateTime: new Date(tx.dateTime).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        month: new Date(tx.dateTime).toLocaleString("default", {
          month: "long",
        }),
      }));

      setTransactions(withIcons);
    };

    // fetching data for the charts
    const fetchChartData = async () => {
      // monthly expenses
      let res = await fetch("http://localhost:5100/api/transactions/monthly-transactions?type=expense", {
        credentials: "include",
      });
      const monthlyExpenses = await res.json();

      // monthly income
      res = await fetch("http://localhost:5100/api/transactions/monthly-transactions?type=income", {
        credentials: "include",
      });
      const monthlyIncome = await res.json();
      const monthLabels = getAllMonthsOfCurrentYear(); //[...new Set([...Object.keys(monthlyExpenses || {}), ...Object.keys(monthlyIncome || {})])];

      // yearly expenses
      res = await fetch("http://localhost:5100/api/transactions/yearly-transactions?type=expense", {
        credentials: "include",
      });
      const yearlyExpenses = await res.json();

      // yearly income
      res = await fetch("http://localhost:5100/api/transactions/yearly-transactions?type=income", {
        credentials: "include",
      });
      const yearlyIncome = await res.json();
      const yearLabels = [...new Set([...Object.keys(yearlyExpenses || {}), ...Object.keys(yearlyIncome || {})])].sort();

      // month expenses
      res = await fetch("http://localhost:5100/api/transactions/month-transactions?type=expense", {
        credentials: "include",
      });
      const monthExpenses = await res.json();

      // month income
      res = await fetch("http://localhost:5100/api/transactions/month-transactions?type=income", {
        credentials: "include",
      });
      const monthIncome = await res.json();
      const dailyLabels = getAllDaysOfCurrentMonth(); //[...new Set([...Object.keys(monthExpenses || {}), ...Object.keys(monthIncome || {})])];

      // console.log("Month Expenses:", monthExpenses);
      // console.log("Test:", dailyLabels.map(label => monthExpenses?.[label] ?? 0));

      const chartData: Record<string, ChartProps> = {
        Yearly: {
          labels: yearLabels,
          datasets: [
            {
              label: "Income",
              data: yearLabels.map((label: string) => yearlyIncome?.[label] ?? 0),
              borderColor: "#3B82F6", // blue
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              fill: false,
              tension: 0.1,
            },
            {
              label: "Expenses",
              data: yearLabels.map((label: string) => yearlyExpenses?.[label] ?? 0),
              borderColor: "#7C2D12", // dark brown/red
              backgroundColor: "rgba(124, 45, 18, 0.1)",
              fill: false,
              tension: 0.1,
            },
          ],
        },
        Monthly: {
          labels: monthLabels,
          datasets: [
            {
              label: "Income",
              data: monthLabels.map((label: string) => monthlyIncome?.[label] ?? 0),
              borderColor: "#3B82F6", // blue
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              fill: false,
              tension: 0.1,
            },
            {
              label: "Expenses",
              data: monthLabels.map((label: string) => monthlyExpenses?.[label] ?? 0),
              borderColor: "#7C2D12", // dark brown/red
              backgroundColor: "rgba(124, 45, 18, 0.1)",
              fill: false,
              tension: 0.1,
            },
          ],
        },
        Daily: {
          labels: dailyLabels,
          datasets: [
            {
              label: "Income",
              data: dailyLabels.map((label: string) => monthIncome?.[label] ?? 0),
              borderColor: "#3B82F6", // blue
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              fill: false,
              tension: 0.1,
            },
            {
              label: "Expenses",
              data: dailyLabels.map((label: string) => monthExpenses?.[label] ?? 0),
              borderColor: "#7C2D12", // dark brown/red
              backgroundColor: "rgba(124, 45, 18, 0.1)",
              fill: false,
              tension: 0.1,
            },
          ],
        },
        Recent: {
          labels: ["March 22", "April 08", "April 15", "April 24", "April 30"],
          datasets: [
            {
              label: "Income",
              data: [0, 0, 0, 0, 4000],
              borderColor: "#3B82F6", // blue
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              fill: false,
              tension: 0.1,
            },
            {
              label: "Expenses",
              data: [70, 48, 1574, 100, 0],
              borderColor: "#7C2D12", // dark brown/red
              backgroundColor: "rgba(124, 45, 18, 0.1)",
              fill: false,
              tension: 0.1,
            },
          ],
        },
      };

      setChartData(chartData);
      // console.log("Chart data fetched:", chartData);
      // console.log(chartData[timeFilter as keyof typeof chartData]);
    };

    fetchData();
    fetchChartData();
  }, []);

  useEffect(() => {
    if (!chartData[timeFilter]) { // if no data for selected time filter
      setTotalIncome(-999);
      setTotalExpenses(-999);
      setTotalBalance(-999);
      return;
    }
    setSummaryData()
  }, [chartData, timeFilter]);

  const handleAddTransaction = (newTx: TransactionWithExtras) => {
    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      // Sort by dateTime descending (most recent first)
      return updated.sort((a: TransactionWithExtras, b: TransactionWithExtras) => {
        const dateA = new Date(a.dateTime);
        const dateB = new Date(b.dateTime);
        return dateB.getTime() - dateA.getTime();
      });
    });
  };
 
  
  // Calculate totals
  // const totalIncome = transactions
  //   .filter((t) => t.type === "income")
  //   .reduce((sum, t) => sum + t.amount, 0);
  // const totalExpenses = Math.abs(
  //   transactions
  //     .filter((t) => t.type === "expense")
  //     .reduce((sum, t) => sum + t.amount, 0)
  // );
  // const totalBalance = totalIncome - totalExpenses;

  const handleCloseForm = () => {
    setActiveForm(null);
    // Clear URL parameters
    window.history.replaceState({}, "", "/cashflows");
  };

  const handleFilter = async (filters: any) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setFilteredTransactions([]);
      return;
    }
    try {
      const res = await fetch("http://localhost:5100/api/transactions/filter", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });
      if (!res.ok) throw new Error("Failed to fetch filtered transactions");
      const data = await res.json();
      setFilteredTransactions(data);
    } catch (err) {
      setFilteredTransactions([]);
    }
  };

  // Add this function to calculate and set summary data
  function setSummaryData() {
    const chart = chartData[timeFilter];
    if (!chart || !chart.data || !chart.data.datasets) {
      setTotalIncome(0);
      setTotalExpenses(0);
      setTotalBalance(0);
      return;
    }
    let income = 0;
    let expenses = 0;
    chart.data.datasets.forEach((ds: { label: string; data: number[] }) => {
      if (ds.label === 'Income') {
        income = ds.data.reduce((sum: number, v: number) => sum + v, 0);
      } else if (ds.label === 'Expenses') {
        expenses = ds.data.reduce((sum: number, v: number) => sum + v, 0);
      }
    });
    setTotalIncome(income);
    setTotalExpenses(Math.abs(expenses));
    setTotalBalance(income - Math.abs(expenses));
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Cashflows</h1>
          <div className="flex gap-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expense">Expenses</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isMobile ? (
            <>
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Add Expense
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[90%] sm:w-[400px]">
                  <div className="py-6">
                    <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
                    <AddExpenseForm
                      onClose={handleCloseForm}
                      onAddTransaction={handleAddTransaction}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Add Income
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[90%] sm:w-[400px]">
                  <div className="py-6">
                    <h2 className="text-xl font-semibold mb-4">Add Income</h2>
                    <AddIncomeForm
                      onClose={handleCloseForm}
                      onAddTransaction={handleAddTransaction}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => setActiveForm("expense")}
              >
                Add Expense
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => setActiveForm("income")}
              >
                Add Income
              </Button>
            </>
          )}
        </div>

        {/* Chart or Form Section - full width */}
        <div className="w-full">
          {!isMobile && activeForm ? (
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">
                  {activeForm === "expense" ? "Add Expense" : "Add Income"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseForm}
                  className="rounded-full h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {activeForm === "expense" ? (
                  <AddExpenseForm
                    onClose={handleCloseForm}
                    onAddTransaction={handleAddTransaction}
                  />
                ) : (
                  <AddIncomeForm
                    onClose={handleCloseForm}
                    onAddTransaction={handleAddTransaction}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">{timeFilter} Chart</CardTitle>
                <div className="flex items-center gap-2">
                  <Tabs value={timeFilter} onValueChange={setTimeFilter}>
                    <TabsList>
                      <TabsTrigger value="Yearly">
                        <CalendarRange className="w-4 h-4 mr-2" />
                        Yearly
                      </TabsTrigger>
                      <TabsTrigger value="Monthly">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Monthly
                      </TabsTrigger>
                      <TabsTrigger value="Daily">
                        <Calendar className="w-4 h-4 mr-2" />
                        This Month
                      </TabsTrigger>
                      <TabsTrigger value="Recent">
                        <Filter className="w-4 h-4 mr-2" />
                        Recent
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Info className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 mb-6">
                  {chartData[timeFilter] ?
                  <LineChart
                    data={chartData[timeFilter]}
                  />
                  : <p>Loading chart...</p>}
                </div>
                {/* Summary Cards */}
                <div className="flex flex-col md:flex-row gap-4">
                  <Card className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                      <span className="text-sm text-gray-600">
                        Total Income
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      ${totalIncome.toFixed(2)}
                    </div>
                  </Card>
                  <Card className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                      <span className="text-sm text-gray-600">
                        Total Expenses
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      ${totalExpenses.toFixed(2)}
                    </div>
                  </Card>
                  <Card className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                      <span className="text-sm text-gray-600">
                        Total Balance
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">
                      ${totalBalance.toFixed(2)}
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        {/* Transactions - full width below charts */}
        <Card className="mb-6 w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl">Transactions</CardTitle>
              <button type="button" className="bg-gray-100 text-gray-800 px-3 py-2 rounded" onClick={() => {
                const today = format(new Date(), 'yyyy-MM-dd');
                setStartDate(today);
                setEndDate(today);
                handleFilter({ startDate: today, endDate: today });
              }}>
                Today
              </button>
              <button type="button" className="bg-gray-100 text-gray-800 px-3 py-2 rounded" onClick={() => {
                const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
                const end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
                setStartDate(start);
                setEndDate(end);
                handleFilter({ startDate: start, endDate: end });
              }}>
                This Month
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionFilterForm onFilter={handleFilter} startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
            {filteredTransactions === null ? (
              <RecentTransactions timeFilter={timeFilter} />
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                {filteredTransactions.length === 0 ? (
                  <div className="text-gray-500">No transactions found.</div>
                ) : (
                  <div className="space-y-4">
                    {filteredTransactions.map((transaction) => {
                      const dateObj = new Date(transaction.dateTime)
                      const date = dateObj.toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                      const time = dateObj.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      // Use the same icon logic as RecentTransactions
                      const iconKey = transaction.category in {
                        food: 1, transport: 1, medicine: 1, groceries: 1, rent: 1, gifts: 1, savings: 1, entertainment: 1, utilities: 1, shopping: 1, education: 1, other: 1, salary: 1, freelance: 1, tutoring: 1, investment: 1, bonus: 1, rental: 1, business: 1, commission: 1, dividend: 1, gift: 1
                      } ? transaction.category : "other";
                      const iconMap = {
                        DollarSign: <span className="inline-block w-5 h-5 bg-gray-300 rounded-full" />,
                        ShoppingBag: <span className="inline-block w-5 h-5 bg-gray-300 rounded-full" />,
                        Home: <span className="inline-block w-5 h-5 bg-gray-300 rounded-full" />,
                        Bus: <span className="inline-block w-5 h-5 bg-gray-300 rounded-full" />,
                        Utensils: <span className="inline-block w-5 h-5 bg-gray-300 rounded-full" />,
                      };
                      // For now, use DollarSign for all
                      const icon = iconMap.DollarSign;
                      return (
                        <div key={transaction.transId}>
                          <div className="text-sm text-gray-600 mb-2">{date}</div>
                          <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                              {icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">{transaction.description}</div>
                              <div className="text-sm text-gray-600">{transaction.category}</div>
                              <div className="text-xs text-orange-500">{time}</div>
                            </div>
                            <div className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                              {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
