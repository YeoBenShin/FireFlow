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
  DollarSign,
  ShoppingBag,
  Home,
  Bus,
  Utensils,
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

interface TransactionWithExtras extends Transaction {
  icon: JSX.Element;
  month: string;
}

export default function CashflowsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [timeFilter, setTimeFilter] = useState("Monthly");
  const [chartData, setChartData] = useState({} as ChartGroup);
  const [transactions, setTransactions] = useState<TransactionWithExtras[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [activeForm, setActiveForm] = useState<"expense" | "income" | null>(
    null
  );
  const isMobile = useIsMobile();

  // Check URL parameters on component mount
  useEffect(() => {
    const openForm = searchParams.get("openForm");
    if (openForm === "expense") {
      setActiveForm("expense");
    } else if (openForm === "income") {
      setActiveForm("income");
    }
  }, [searchParams]);

  type IconName = "DollarSign" | "ShoppingBag" | "Home" | "Bus" | "Utensils";

  const categoryIconMap: Record<string, IconName> = {
    food: "Utensils",
    transport: "Bus",
    medicine: "DollarSign",
    groceries: "ShoppingBag",
    rent: "Home",
    gifts: "ShoppingBag",
    savings: "DollarSign",
    entertainment: "ShoppingBag",
    utilities: "DollarSign",
    shopping: "ShoppingBag",
    education: "DollarSign",
    other: "DollarSign",
  };

  const iconMap: Record<IconName, JSX.Element> = {
    DollarSign: <DollarSign className="w-5 h-5" />,
    ShoppingBag: <ShoppingBag className="w-5 h-5" />,
    Home: <Home className="w-5 h-5" />,
    Bus: <Bus className="w-5 h-5" />,
    Utensils: <Utensils className="w-5 h-5" />,
  };

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

interface ChartGroup {
  [key: string]: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean;
      tension?: number;
    }[];
  }
}

function setSummaryData() {
  // for initial load
  const incomeData = chartData[timeFilter].datasets[0].data;
  const expenseData = chartData[timeFilter].datasets[1].data;
  const tIncome = incomeData.reduce((sum, value) => sum + value, 0);
  const tExpense = expenseData.reduce((sum, value) => sum + value, 0);
  setTotalIncome(tIncome);
  setTotalExpenses(tExpense);
  setTotalBalance(tIncome - tExpense);
}

  useEffect(() => {
    // Fetch recent transactions from the backend
    const fetchData = async () => {
      const res = await fetch("http://localhost:5100/api/transactions", {
        credentials: "include",
      });
      const data = await res.json();

      // Replace icon string with JSX component
      const withIcons = data.map((tx) => ({
        ...tx,
        dateTime: new Date(tx.dateTime).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        icon: iconMap[categoryIconMap[tx.category]] || (
          <DollarSign className="w-5 h-5" />
        ),
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

    const chartData = {
      Yearly: {
        labels: yearLabels,
        datasets: [
          {
            label: "Income",
            data: yearLabels.map(label => yearlyIncome?.[label] ?? 0),
            borderColor: "#3B82F6", // blue
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: false,
            tension: 0.1,
          },
          {
            label: "Expenses",
            data: yearLabels.map(label => yearlyExpenses?.[label] ?? 0),
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
            data: monthLabels.map(label => monthlyIncome?.[label] ?? 0),
            borderColor: "#3B82F6", // blue
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: false,
            tension: 0.1,
          },
          {
            label: "Expenses",
            data: monthLabels.map(label => monthlyExpenses?.[label] ?? 0),
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
            data: dailyLabels.map(label => monthIncome?.[label] ?? 0),
            borderColor: "#3B82F6", // blue
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: false,
            tension: 0.1,
          },
          {
            label: "Expenses",
            data: dailyLabels.map(label => monthExpenses?.[label] ?? 0),
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
      return updated.sort((a, b) => {
        const dateA = new Date(a.dateTime);
        const dateB = new Date(b.dateTime);
        return dateB.getTime() - dateA.getTime();
      });
    });
  };
 
  // Filter transactions based on the selected timeFilter
  function getFilteredTransactions() {
    // if (timeFilter === "Yearly") {
    //   const currentYear = new Date().getFullYear();
    //   return transactions.filter(tx => {
    //     const txYear = new Date(tx.dateTime).getFullYear();
    //     return txYear === currentYear;
    //   });
    // }
    if (timeFilter === "Monthly") {
      const now = new Date();
      return transactions.filter(tx => {
        const txDate = new Date(tx.dateTime);
        return (
          txDate.getFullYear() === now.getFullYear()
        );
      });
    }
    if (timeFilter === "Daily") {
      const now = new Date();
      return transactions.filter(tx => {
        const txDate = new Date(tx.dateTime);
        return (
          txDate.getFullYear() === now.getFullYear() &&
          txDate.getMonth() === now.getMonth()
        );
      });
    }
    if (timeFilter === "Recent") {
      return transactions.slice(0, 5);
    }
    return transactions;
  }

  // Group filtered transactions by month
  const groupedTransactions = getFilteredTransactions().reduce((acc, transaction) => {
    if (!acc[transaction.month]) {
      acc[transaction.month] = [];
    }
    acc[transaction.month].push(transaction);
    return acc;
  }, {} as Record<string, typeof transactions>);

  // const filteredTransactions =
  //   activeTab === "all"
  //     ? transactions
  //     : transactions.filter((t) => t.type === activeTab);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Chart or Form */}
          <div className="lg:col-span-2">
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
              <Card className="mb-6">
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
                    {chartData[timeFilter as keyof typeof chartData] ?
                    <LineChart
                      data={chartData[timeFilter as keyof typeof chartData]}
                    />
                    : <p>Loading chart...</p>}
                  </div>

                  {/* Legend */}
                  {/* <div className="flex justify-center gap-8 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm font-medium">Income</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-900 rounded"></div>
                      <span className="text-sm font-medium">Expenses</span>
                    </div>
                  </div> */}

                  <div className="flex justify-center gap-8 mb-6">
                      <span className="text-xl font-medium">
                        {
                          timeFilter === "Yearly"
                            ? "Life Time Cashflow"
                            : timeFilter === "Monthly"
                            ? "Cashflow This Year"
                            : timeFilter === "Daily"
                            ? "Cashflow This Month"
                            : "Filtered Cashflow"
                        }
                        </span>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4">
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

                    <Card className="p-4">
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

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                        <span className="text-sm text-gray-600">
                          Total Balance
                        </span>
                      </div>
                      <div className={`text-2xl font-bold ${
                                    totalBalance > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}>
                        ${totalBalance.toFixed(2)}
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Transactions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedTransactions).map(
                    ([month, monthTransactions]) => (
                      <div key={month}>
                        <h3 className="font-semibold text-lg mb-4">{month}</h3>
                        <div className="space-y-4">
                          {monthTransactions
                            .filter(
                              (transaction) =>
                                activeTab === "all" ||
                                transaction.type === activeTab
                            )
                            .map((transaction: TransactionWithExtras) => (
                              <div
                                key={transaction.transId}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                                  {transaction.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-800">
                                    {transaction.description}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {transaction.category}
                                  </div>
                                  <div className="text-xs text-orange-500">
                                    {transaction.dateTime}
                                  </div>
                                </div>
                                <div
                                  className={`font-bold ${
                                    transaction.type === "income"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {transaction.type === "income" ? "+" : "-"}$
                                  {Math.abs(transaction.amount).toFixed(2)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
