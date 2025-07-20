"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "../_components/layout/main-layout";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Trash2 } from "lucide-react";
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
  Briefcase,
  Laptop,
  BookOpen,
  BarChart,
  Sparkles,
  Building2,
  FileText,
  Banknote,
  Gift,
  GraduationCap,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip"
import { AddExpenseForm } from "../_components/forms/add-expense-form";
import { AddIncomeForm } from "../_components/forms/add-income-form";
import { Sheet, SheetContent, SheetTrigger } from "@/app/_components/ui/sheet";
import { useIsMobile } from "../_hooks/use-mobile";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface Transaction {
  id: number;
  type: string;
  dateTime: string;
  amount: number;
  description?: string;
  category: string;
}

interface TransactionWithExtras extends Transaction {
  icon: JSX.Element;
  month: string;
}

export default function CashflowsPage() {
  const searchParams = useSearchParams();
  // const [activeTab, setActiveTab] = useState("all");
  const [timeFilter, setTimeFilter] = useState("Monthly");
  const [chartData, setChartData] = useState({} as ChartGroup);
  const [transactions, setTransactions] = useState<TransactionWithExtras[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithExtras[] | null>(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [activeForm, setActiveForm] = useState<"expense" | "income" | null>(
    null
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const isMobile = useIsMobile();
  const [filterChartData, setFilterChartData] = useState(null); 

  // Check URL parameters on component mount
  useEffect(() => {
    const openForm = searchParams.get("openForm");
    if (openForm === "expense") {
      setActiveForm("expense");
    } else if (openForm === "income") {
      setActiveForm("income");
    }
  }, [searchParams]);

  type IconName = "GraduationCap" | "DollarSign" | "ShoppingBag" | "Home" | "Bus" | "Utensils" | "Briefcase" | "Laptop" | "BookOpen" | "BarChart" | "Sparkles" | "Building2" | "FileText" | "Banknote" | "Gift";

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
    education: "GraduationCap",
    other: "DollarSign",
    salary: "Briefcase",
    freelance: "Laptop",
    tutoring: "BookOpen",
    investment: "BarChart",
    bonus: "Sparkles",
    rental: "Building2",
    business: "Briefcase",
    commission: "FileText",
    dividend: "Banknote",
    gift: "Gift",
  };

  const iconMap: Record<IconName, JSX.Element> = {
    DollarSign: <DollarSign className="w-5 h-5" />,
    GraduationCap: <GraduationCap className="w-5 h-5" />,
    ShoppingBag: <ShoppingBag className="w-5 h-5" />,
    Home: <Home className="w-5 h-5" />,
    Bus: <Bus className="w-5 h-5" />,
    Utensils: <Utensils className="w-5 h-5" />,
    Briefcase: <Briefcase className="w-5 h-5" />,
    Laptop: <Laptop className="w-5 h-5" />,
    BookOpen: <BookOpen className="w-5 h-5" />,
    BarChart: <BarChart className="w-5 h-5" />,
    Sparkles: <Sparkles className="w-5 h-5" />,
    Building2: <Building2 className="w-5 h-5" />,
    FileText: <FileText className="w-5 h-5" />,
    Banknote: <Banknote className="w-5 h-5" />,
    Gift: <Gift className="w-5 h-5" />,
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

const fetchChartData = async () => {
  const token = localStorage.getItem("authToken");
    // monthly expenses
    let res = await fetch("https://fireflow-m0z1.onrender.com/api/transactions/monthly-transactions?type=expense", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    const monthlyExpenses = await res.json();

    // monthly income
    res = await fetch("https://fireflow-m0z1.onrender.com/api/transactions/monthly-transactions?type=income", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    const monthlyIncome = await res.json();
    const monthLabels = getAllMonthsOfCurrentYear(); //[...new Set([...Object.keys(monthlyExpenses || {}), ...Object.keys(monthlyIncome || {})])];

    // yearly expenses
    res = await fetch("https://fireflow-m0z1.onrender.com/api/transactions/yearly-transactions?type=expense", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    const yearlyExpenses = await res.json();

    // yearly income
    res = await fetch("https://fireflow-m0z1.onrender.com/api/transactions/yearly-transactions?type=income", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    const yearlyIncome = await res.json();
    const yearLabels = [...new Set([...Object.keys(yearlyExpenses || {}), ...Object.keys(yearlyIncome || {})])].sort();

    // month expenses
    res = await fetch("https://fireflow-m0z1.onrender.com/api/transactions/month-transactions?type=expense", {
        credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const monthExpenses = await res.json();

    // month income
    res = await fetch("https://fireflow-m0z1.onrender.com/api/transactions/month-transactions?type=income", {
        credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
       Filter: {
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
    };
    setChartData(chartData);
    };

     const fetchAll = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const res = await fetch("https://fireflow-m0z1.onrender.com/api/transactions", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched transactions:", data);
        const withIcons = data.map((tx: Transaction) => ({
        ...tx,
        // dateTime: new Date(tx.dateTime).toLocaleDateString("en-GB", {
        //   day: "2-digit",
        //   month: "long",
        //   year: "numeric",
        // }),
        icon: categoryIconMap[tx.category]
        ? iconMap[categoryIconMap[tx.category]]
        : <DollarSign className="w-5 h-5" />,
        month: new Date(tx.dateTime).toLocaleString("default", {
          month: "long",
        }),
      }));

      setTransactions(withIcons);
        setFilteredTransactions(null);
      }
    };
  useEffect(() => {
    fetchAll();
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
    const withIcon: TransactionWithExtras = {
    ...newTx,
    icon: categoryIconMap[newTx.category]
      ? iconMap[categoryIconMap[newTx.category]]
      : <DollarSign className="w-5 h-5" />,
    month: new Date(newTx.dateTime).toLocaleString("default", { month: "long" }),
  };
    setTransactions((prev) => {
      const updated = [withIcon, ...prev];
      // Sort by dateTime descending (most recent first)
      return updated.sort((a, b) => {
        const dateA = new Date(a.dateTime);
        const dateB = new Date(b.dateTime);
        return dateB.getTime() - dateA.getTime();
      });
    });
    fetchChartData(); // Refresh chart data after adding transaction
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
    if (timeFilter === "Filter") {
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

  // Add TransactionFilterForm component for filtering transactions
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
        <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-orange-500">Filter by date range</span>
        <div className="flex gap-2">
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded p-2" placeholder="Start date" />
        <span className="text-sm mt-2 text-orange-500">to</span>
        <input type="date" value={endDate} min = {startDate} onChange={e => setEndDate(e.target.value)} className="border rounded p-2" placeholder="End date" />
        </div>
        </div>
        <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded">Filter</button>
        {(startDate || endDate) && (
          <button type="button" className="ml-2 text-orange-500 underline" onClick={() => { setStartDate(""); setEndDate(""); onFilter({}); }}>
            Clear Dates
          </button>
        )}
      </form>
    );
  }


  async function handleDeleteTransaction(id: number){
    const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`https://fireflow-m0z1.onrender.com/api/transactions/delete`, {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transId: id }), 
      });

      if (!response.ok) {
        throw new Error(`Failed to delete transaction: ${response.statusText}`);
      }
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      setFilteredTransactions((prev) =>
        prev ? prev.filter((tx) => tx.id !== id) : null
      );
      fetchChartData(); // Refresh chart data after deletion

      console.log("Transaction deleted");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction.");
      // Optionally, show user-friendly error notification here
    }

  } ;

  // Filter handler: filter in memory
  const handleFilter = (filters: any) => {
    let filtered = [...transactions];
    if (filters.type) {
      filtered = filtered.filter((tx: Transaction) => tx.type === filters.type);
    }
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter((tx: Transaction) => filters.category.includes(tx.category));
    }
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((tx: Transaction) => {
        const txDate = new Date(tx.dateTime).toLocaleDateString("en-CA");
        return txDate >= filters.startDate && txDate <= filters.endDate;
      });
    } else if (filters.startDate) {
      filtered = filtered.filter((tx: Transaction) => {
        const txDate = new Date(tx.dateTime).toLocaleDateString("en-CA");
        return txDate >= filters.startDate;
      });
    } else if (filters.endDate) {
      filtered = filtered.filter((tx: Transaction) => {
        const txDate = new Date(tx.dateTime).toLocaleDateString("en-CA");
        return txDate <= filters.endDate;
      });
    }
    setFilteredTransactions(filtered);
    generateFilterChartData(filtered);
  };

  const generateFilterChartData = (filteredData: Transaction[]) => {
  if (filteredData.length === 0) {
    // If no filtered data, show empty chart
    const emptyFilterData = {
      labels: ["No data"],
      datasets: [
        {
          label: "Income",
          data: [0],
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Expenses",
          data: [0],
          borderColor: "#7C2D12",
          backgroundColor: "rgba(124, 45, 18, 0.1)",
          fill: false,
          tension: 0.1,
        },
      ],
    };
    
    setChartData(prevData => ({
      ...prevData,
      Filter: emptyFilterData
    }));
    return;
  }

  const groupedByDate = filteredData.reduce((acc, tx) => {
    const date = new Date(tx.dateTime).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    
    if (!acc[date]) {
      acc[date] = { income: 0, expenses: 0 };
    }
    
    if (tx.type === 'income') {
      acc[date].income += tx.amount;
    } else {
      acc[date].expenses += Math.abs(tx.amount);
    }
    
    return acc;
  }, {} as Record<string, { income: number; expenses: number }>);

  // Sort dates chronologically
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const incomeData = sortedDates.map(date => groupedByDate[date].income);
  const expenseData = sortedDates.map(date => groupedByDate[date].expenses);

  const newFilterChartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Expenses",
        data: expenseData,
        borderColor: "#7C2D12",
        backgroundColor: "rgba(124, 45, 18, 0.1)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  // Update the chart data with the new filter data
  setChartData(prevData => ({
    ...prevData,
    Filter: newFilterChartData
  }));
};

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Cashflows</h1>
          {/* <div className="flex gap-3">
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
          </div> */}
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
            <Card className="mb-6 w-full">
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
                      <TabsTrigger value="Filter">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent
                        className="text-white px-3 py-2 text-xs"
                        side="top"
                        align="start"
                        style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
                      >
                        <p>
                          The filter option allows you to view the chart based
                          on the specific transaction filters you applied below
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 mb-6">
                  {chartData[timeFilter as keyof typeof chartData] ? (
                    <LineChart
                      data={chartData[timeFilter as keyof typeof chartData]}
                    />
                  ) : (
                    <Box sx={{ display: "flex" }}>
                      <CircularProgress color="inherit" />
                    </Box>
                  )}
                </div>
                {/* Legend and summary cards ... */}
                <div className="flex justify-center gap-8 mb-6">
                  <span className="text-xl font-medium">
                    {timeFilter === "Yearly"
                      ? "Life Time Cashflow"
                      : timeFilter === "Monthly"
                      ? "Cashflow This Year"
                      : timeFilter === "Daily"
                      ? "Cashflow This Month"
                      : "Filtered Cashflow"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
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
                      <span className="text-sm text-gray-600">
                        Total Balance
                      </span>
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        totalBalance > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ${totalBalance.toFixed(2)}
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        {/* Transactions Section - full width below the chart */}
        <div className="w-full">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl">Transactions</CardTitle>
                <button
                  type="button"
                  className="bg-gray-100 text-gray-800 px-3 py-2 rounded"
                  onClick={() => {
                    const today = format(new Date(), "yyyy-MM-dd");
                    setStartDate(today);
                    setEndDate(today);
                    // Optionally trigger filter here if you want instant effect:
                    // handleFilter({ startDate: today, endDate: today });
                  }}
                >
                  Today
                </button>
                <button
                  type="button"
                  className="bg-gray-100 text-gray-800 px-3 py-2 rounded"
                  onClick={() => {
                    const start = format(
                      startOfMonth(new Date()),
                      "yyyy-MM-dd"
                    );
                    const end = format(endOfMonth(new Date()), "yyyy-MM-dd");
                    setStartDate(start);
                    setEndDate(end);
                    // Optionally trigger filter here if you want instant effect:
                    // handleFilter({ startDate: start, endDate: end });
                  }}
                >
                  This Month
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <TransactionFilterForm
                  onFilter={handleFilter}
                  startDate={startDate}
                  endDate={endDate}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                />
                <div className="space-y-4">
                  {(filteredTransactions || transactions).length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      No transactions found for the selected filters.
                    </div>
                  ) : (
                    (filteredTransactions || transactions).map(
                      (transaction) => {
                        const dateObj = new Date(transaction.dateTime);
                        const day = dateObj.getDate();
                        const month = dateObj.toLocaleString("default", {
                          month: "long",
                        });
                        const year = dateObj.getFullYear();
                        let hour = dateObj.getHours();
                        const minute = String(dateObj.getMinutes()).padStart(
                          2,
                          "0"
                        );
                        const ampm = hour >= 12 ? "PM" : "AM";
                        hour = hour % 12;
                        hour = hour ? hour : 12; // the hour '0' should be '12'
                        const formattedDate = `${day} ${month} ${year}, ${hour}:${minute} ${ampm}`;
                        return (
                          <div
                            key={transaction.id}
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
                                {formattedDate}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
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
                              <button
                                onClick={() =>
                                  handleDeleteTransaction(transaction.id)
                                }
                                className="text-red-500 hover:text-red-700"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
