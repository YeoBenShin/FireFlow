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

export default function CashflowsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [timeFilter, setTimeFilter] = useState("Monthly");
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

  // Chart data for different time periods
  const chartData = {
    Yearly: {
      labels: ["2020", "2021", "2022", "2023", "2024"],
      datasets: [
        {
          label: "Income",
          data: [24000, 28000, 32000, 38000, 42000],
          borderColor: "#3B82F6", // blue
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Expenses",
          data: [20000, 22000, 26000, 30000, 34000],
          borderColor: "#7C2D12", // dark brown/red
          backgroundColor: "rgba(124, 45, 18, 0.1)",
          fill: false,
          tension: 0.1,
        },
      ],
    },
    Monthly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Income",
          data: [3500, 3500, 3500, 4000, 4000, 4000],
          borderColor: "#3B82F6", // blue
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Expenses",
          data: [2800, 3200, 2900, 3400, 3100, 3300],
          borderColor: "#7C2D12", // dark brown/red
          backgroundColor: "rgba(124, 45, 18, 0.1)",
          fill: false,
          tension: 0.1,
        },
      ],
    },
    Daily: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Income",
          data: [0, 0, 0, 0, 4000, 150, 0],
          borderColor: "#3B82F6", // blue
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Expenses",
          data: [45, 120, 85, 65, 200, 350, 90],
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

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:5100/api/transactions", {
        credentials: "include",
      });
      const data = await res.json();


      // console.log("🧾 Transactions fetched:", data);
      // If your API returns { transactions: [...] }
      const txArray = Array.isArray(data) ? data : data.transactions;

      if (!Array.isArray(txArray)) {
        console.error("Expected an array of transactions but got:", txArray);
        setTransactions([]);
        return;
      }

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

    fetchData();
  }, []);

  const handleAddTransaction = (newTx) => {
    console.log("🧾 New transaction added:", newTx);
    setTransactions((prev) => [...prev, newTx]);
  };

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.month]) {
      acc[transaction.month] = [];
    }
    acc[transaction.month].push(transaction);
    return acc;
  }, {} as Record<string, typeof transactions>);

  const filteredTransactions =
    activeTab === "all"
      ? transactions
      : transactions.filter((t) => t.type === activeTab);

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(
    transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
  );
  const totalBalance = totalIncome - totalExpenses;

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
                          Daily
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
                    <LineChart
                      data={chartData[timeFilter as keyof typeof chartData]}
                    />
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
                        -${totalExpenses.toFixed(2)}
                      </div>
                    </Card>

                    <Card className="p-4">
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

          {/* Recent Transactions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Recent Transactions</CardTitle>
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
                            .map((transaction) => (
                              <div
                                key={transaction.trans_id}
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
