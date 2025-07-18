"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "../_components/layout/main-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Info, Plus, X, Users, ChevronDown, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip"
import { AddGoalForm } from "../_components/forms/add-goal-form";
import { Badge } from "@/app/_components/ui/badge";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";

interface Participant {
  goal_id: number;
  user_id: string;
  role: "owner" | "collaborator" | "pending";
  allocated_amount: number;
  user: {
    name: string;
  };
}

interface Goal {
  goal_id: number;
  title: string;
  category: string;
  target_date: string;
  amount: number;
  status: string;
  description?: string;
  user_id: string;
  current_amount: number;
  participantCount: number;
  userRole: "owner" | "collaborator" | "pending";
}

interface GoalWithParticipant {
  goal_id: number;
  role: "owner" | "collaborator" | "pending";
  allocated_amount: number;
  goal: Goal;
}

interface SavingsData {
  availableSavings: number
  availableSavingsLastMonth: number
  totalAllocated: number
  baseSavings: number
}

export default function GoalsPage() {
  const CategoryBadge = ({ category }: { category: string }) => (
    <Badge
      className={`${getCategoryColor(
        category
      )} text-xs px-3 py-1 min-w-[70px] text-center font-medium justify-center flex items-center`}
    >
      {getCategoryLabel(category)}
    </Badge>
  );

  const StatusBadge = ({ status }: { status: string }) => (
    <Badge
      variant={status === "completed" ? "default" : "secondary"}
      className="text-xs px-3 py-1 min-w-[80px] text-center font-medium capitalize justify-center flex items-center"
    >
      {status}
    </Badge>

  )
  
  const [showForm, setShowForm] = useState(false)
  const [goalData, setGoalData] = useState<GoalWithParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedGoals, setExpandedGoals] = useState<Set<number>>(new Set())
  const [participants, setParticipants] = useState<Record<number, Participant[]>>({})
  const [savingsData, setSavingsData] = useState<SavingsData>()



  const toggleGoalExpansion = async (goalId: number) => {
    const newExpanded = new Set(expandedGoals);

    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
      setExpandedGoals(newExpanded);
    } else {
      newExpanded.add(goalId);
      setExpandedGoals(newExpanded);

      // Fetch participants if not already loaded
      if (!participants[goalId]) {
        try {
          console.log(`Fetching participants for goal ${goalId}...`);
          const response = await fetch(
            `https://fireflow-m0z1.onrender.com/api/goals/${goalId}/participants`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          console.log(`Response status: ${response.status}`);

          if (response.ok) {
            const participantData = await response.json();
            console.log("Participant data received:", participantData);
            setParticipants((prev) => ({
              ...prev,
              [goalId]: participantData,
            }));
          } else {
            console.error(
              `Failed to fetch participants: ${response.status} ${response.statusText}`
            );
          }
        } catch (error) {
          console.error("Error fetching participants:", error);
        }
      }
    }
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      console.log(
        "Attempting to fetch from:",
        "https://fireflow-m0z1.onrender.com/api/goals/with-participants"
      ); // Debug log

      const response = await fetch(
        "https://fireflow-m0z1.onrender.com/api/goals/with-participants",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status); // Debug log

      if (!response.ok) {
        throw new Error(`Failed to fetch goals: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetched goals data:", data);
      setGoalData(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching goals:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const savingData = async() => {
  try {
        const savingsResponse = await fetch('https://fireflow-m0z1.onrender.com/api/users/savings', {
          credentials: 'include'
        })
        if (savingsResponse.ok) {
          const savings = await savingsResponse.json()
          setSavingsData(savings)
        }
      } catch (error) {
        console.warn('Savings endpoint not available')
      }

    }

  const handleGoalCreated = () => {
    setShowForm(false); // Close the form
    fetchGoals(); // Refresh the data
  };

  useEffect(() => {

    fetchGoals()
    savingData()

    // Refresh data when user returns to this page (e.g., from allocation page)
    const handleFocus = () => {
      console.log("Page gained focus, refreshing goals data...")
      fetchGoals()
      savingData()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, refreshing goals data...")
        fetchGoals()
        savingData()

      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Extract goals from the participant data
  const goals = goalData.map((item) => ({
    ...item.goal,
    userRole: item.role,
    userAllocatedAmount: item.allocated_amount,
  }));

  // Determine collaborative status based on participant count
  const personalGoals = goals.filter((goal) => goal.participantCount <= 1);
  // Only show collaborative goals where user is not pending (either owner or accepted collaborator)
  const collaborativeGoals = goals.filter(
    (goal) => goal.participantCount > 1 && goal.userRole !== "pending"
  );

  const pendingGoals = personalGoals.filter(
    (goal) => goal.status === "pending" || goal.status === "in-progress"
  );
  const completedGoals = personalGoals.filter(
    (goal) => goal.status === "completed"
  );
  
  const pendingCollaborativeGoals = collaborativeGoals.filter(
    (goal) => goal.status === "pending" || goal.status === "in-progress"
  );
  const completedCollaborativeGoals = collaborativeGoals.filter(
    (goal) => goal.status === "completed"
  );

  const getDaysLeft = (target_date: string) => {
    const today = new Date();
    const due = new Date(target_date);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const calculateProgress = (current: number, amount: number) => {
    return Math.round((current / amount) * 100);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      car: "bg-blue-100 text-blue-800",
      home: "bg-green-100 text-green-800",
      travel: "bg-purple-100 text-purple-800",
      education: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      car: "Car",
      home: "Home",
      travel: "Travel",
      education: "Education",
      other: "Other",
    };
    return labels[category as keyof typeof labels] || "Other";
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading goals...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-screen">
        {/* My Goals Section - Fixed width */}
        <div className="lg:col-span-2">

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              My Goals
            </h2>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>



          {/* Personal Goals */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Personal Goals
                         <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent className = "text-white px-3 py-2 text-xs" side="top" align="start"
             style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}>
              <p>Add personal goals to track and allocate to it yourself</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
              </CardTitle>
              <Tabs.Root defaultValue="pending" className="w-full">
                {/* Tab List */}
                <Tabs.List className="flex w-full rounded-md bg-orange-100 overflow-hidden">
                  {/* Pending Tab */}
                  <Tabs.Trigger
                    value="pending"
                    className="flex-1 text-center px-4 py-2 text-sm font-semibold transition-all duration-200
        data-[state=active]:bg-orange-500 
        data-[state=active]:text-white 
        data-[state=inactive]:bg-transparent 
        data-[state=inactive]:text-orange-700 
        hover:data-[state=inactive]:bg-orange-200"
                  >
                    In Progress
                  </Tabs.Trigger>
                  {/* Completed Tab */}
                  <Tabs.Trigger
                    value="completed"
                    className="flex-1 text-center px-4 py-2 text-sm font-semibold transition-all duration-200
        data-[state=active]:bg-orange-500 
        data-[state=active]:text-white 
        data-[state=inactive]:bg-transparent 
        data-[state=inactive]:text-orange-700 
        hover:data-[state=inactive]:bg-orange-200"
                  >
                    Completed Goals
                  </Tabs.Trigger>
                </Tabs.List>
                {/* Content Areas */}
                <Tabs.Content
                  value="pending"
                  className="p-4 rounded-b-md bg-white"
                >
                  {pendingGoals.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No pending goals found. Start by adding a new goal!
                      </p>
                    </div>
                  ) : (
                    pendingGoals.map((goal) => {
                      const daysLeft = getDaysLeft(goal.target_date);
                      const currentAmount = goal.current_amount || 0;
                      const calculatedProgress = Math.round(
                        (currentAmount / goal.amount) * 100
                      );

                      return (
                        <div
                          key={goal.goal_id}
                          className="p-4 bg-orange-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <CategoryBadge category={goal.category} />
                            <div className="flex-1">
                              <h4 className="font-semibold text-base leading-tight">
                                {goal.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {daysLeft} Days Left (
                                {formatDate(goal.target_date)})
                              </p>
                              {goal.description && (
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                  {goal.description}
                                </p>
                              )}
                            </div>
                            <StatusBadge status={goal.status} />
                          </div>
                          <div className="flex justify-between items-center mb-3 mt-4">
                            <span className="font-semibold text-base">
                              ${(currentAmount || 0).toLocaleString()}
                            </span>
                            <span className="text-gray-600 text-base font-medium">
                              ${(goal.amount || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className="bg-orange-500 h-3 rounded-full transition-all duration-300 ease-in-out"
                              style={{
                                width: `${Math.min(calculatedProgress, 100)}%`,
                              }}
                            />
                          </div>
                          <div className="text-right text-sm text-orange-500 font-medium mb-3">
                            {calculatedProgress}%
                          </div>
                        </div>
                      );
                    })
                  )}{" "}
                  {/* ADDED: Missing closing parenthesis and brace */}
                </Tabs.Content>
                <Tabs.Content
                  value="completed"
                  className="p-4 rounded-b-md bg-white"
                >
                
                  <CardContent className="space-y-4">
                    {completedGoals.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          No completed goals found. Start by adding a new goal!
                        </p>
                      </div>
                    ) : (
                      completedGoals.map((goal) => {
                        const daysLeft = getDaysLeft(goal.target_date);
                        const currentAmount = goal.current_amount || 0;
                        const calculatedProgress = Math.round(
                          (currentAmount / goal.amount) * 100
                        );

                        return (
                          <div
                            key={goal.goal_id}
                            className="p-4 bg-orange-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <CategoryBadge category={goal.category} />
                              <div className="flex-1">
                                <h4 className="font-semibold text-base leading-tight">
                                  {goal.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {daysLeft} Days Left (
                                  {formatDate(goal.target_date)})
                                </p>
                                {goal.description && (
                                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                    {goal.description}
                                  </p>
                                )}
                              </div>
                              <StatusBadge status={goal.status} />
                            </div>
                            <div className="flex justify-between items-center mb-3 mt-4">
                              <span className="font-semibold text-base">
                                ${(currentAmount || 0).toLocaleString()}
                              </span>
                              <span className="text-gray-600 text-base font-medium">
                                ${(goal.amount || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                              <div
                                className="bg-orange-500 h-3 rounded-full transition-all duration-300 ease-in-out"
                                style={{
                                  width: `${Math.min(
                                    calculatedProgress,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <div className="text-right text-sm text-orange-500 font-medium mb-3">
                              {calculatedProgress}%
                            </div>
                          </div>
                        );
                      })
                    )}{" "}
                    {/* ADDED: Missing closing parenthesis and brace */}
                  </CardContent>
                </Tabs.Content>
              </Tabs.Root>
            </CardHeader>
          </Card>

          {/* Collaborative Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Collaborative Goals
                                        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent className = "text-white px-3 py-2 text-xs" side="top" align="start"
             style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}>
              <p>Add collaborative goals to track and allocate with friend(s)! <br/>
              Head over to the friends page to add other users and collaborate with them</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
              </CardTitle>
              <Tabs.Root defaultValue="pending" className="w-full">
                {/* Tab List */}
                <Tabs.List className="flex w-full rounded-md bg-orange-100 overflow-hidden">
                  {/* Pending Tab */}
                  <Tabs.Trigger
                    value="pending"
                    className="flex-1 text-center px-4 py-2 text-sm font-semibold transition-all duration-200
        data-[state=active]:bg-orange-500 
        data-[state=active]:text-white 
        data-[state=inactive]:bg-transparent 
        data-[state=inactive]:text-orange-700 
        hover:data-[state=inactive]:bg-orange-200"
                  >
                    In Progress
                  </Tabs.Trigger>
                  {/* Completed Tab */}
                  <Tabs.Trigger
                    value="completed"
                    className="flex-1 text-center px-4 py-2 text-sm font-semibold transition-all duration-200
        data-[state=active]:bg-orange-500 
        data-[state=active]:text-white 
        data-[state=inactive]:bg-transparent 
        data-[state=inactive]:text-orange-700 
        hover:data-[state=inactive]:bg-orange-200"
                  >
                    Completed Goals
                  </Tabs.Trigger>
                </Tabs.List>
                {/* Content Areas */}
                <Tabs.Content
                  value="pending"
                  className="p-4 rounded-b-md bg-white"
                >
                  {pendingCollaborativeGoals.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No pending collaborative goals found. Start by creating a
                        collaborative goal!
                      </p>
                    </div>
                  ) : (
                    pendingCollaborativeGoals.map((goal) => {
                      const daysLeft = getDaysLeft(goal.target_date);
                      const currentAmount = goal.current_amount || 0;
                      const calculatedProgress = Math.round(
                        (currentAmount / goal.amount) * 100
                      );

                      return (
                        <div
                          key={goal.goal_id}
                          className="p-4 bg-orange-50 rounded-lg mb-4"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <CategoryBadge category={goal.category} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-base leading-tight">
                                  {goal.title}
                                </h4>
                                {goal.participantCount > 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    <Users className="w-3 h-3 mr-1" />
                                    {goal.participantCount} people
                                  </Badge>
                                )}
                                {goal.userRole && (
                                  <Badge
                                    variant={
                                      goal.userRole === "owner"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {goal.userRole}
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm text-gray-600 mt-1">
                                {daysLeft} Days Left ({formatDate(goal.target_date)}
                                )
                              </p>

                              {goal.description && (
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                  {goal.description}
                                </p>
                              )}
                            </div>
                            <StatusBadge status={goal.status} />
                          </div>

                          <div className="flex justify-between items-center mb-3 mt-4">
                            <span className="font-semibold text-base">
                              ${(currentAmount || 0).toLocaleString()}
                            </span>
                            <span className="text-gray-600 text-base font-medium">
                              ${(goal.amount || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className="bg-orange-500 h-3 rounded-full transition-all duration-300 ease-in-out"
                              style={{
                                width: `${Math.min(calculatedProgress, 100)}%`,
                              }}
                            />
                          </div>
                          <div className="text-right text-sm text-orange-500 font-medium mb-3">
                            {calculatedProgress}%
                          </div>

                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                Your contribution:
                              </span>
                              <span className="text-sm font-medium">
                                ${(goal.userAllocatedAmount || 0).toLocaleString()}
                              </span>
                            </div>

                            {/* Expandable Participants Section */}
                            {goal.participantCount > 1 && (
                              <div className="mt-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleGoalExpansion(goal.goal_id)}
                                  className="w-full text-sm text-gray-600 hover:text-gray-800 h-8"
                                >
                                  <span>View all participants</span>
                                  {expandedGoals.has(goal.goal_id) ? (
                                    <ChevronUp className="w-4 h-4 ml-1" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                  )}
                                </Button>

                                {expandedGoals.has(goal.goal_id) &&
                                  participants[goal.goal_id] && (
                                    <div className="mt-4 space-y-4">
                                      {participants[goal.goal_id].map(
                                        (participant) => (
                                          <div
                                            key={participant.user_id}
                                            className="flex items-center justify-between p-4 bg-orange-25 rounded-lg border border-orange-100"
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                <span className="text-orange-600 font-semibold text-lg">
                                                  {participant.user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                                </span>
                                              </div>
                                              <div className="flex flex-col">
                                                <span className="text-base font-semibold text-gray-800">
                                                  {participant.user.name}
                                                </span>
                                                <Badge
                                                  variant="secondary"
                                                  className="text-xs w-fit mt-1"
                                                >
                                                  {participant.role === "owner"
                                                    ? "👑 Owner"
                                                    : participant.role ===
                                                      "collaborator"
                                                    ? "🤝 Collaborator"
                                                    : "⏳ Pending"}
                                                </Badge>
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-lg font-bold text-gray-800">
                                                $
                                                {(
                                                  participant.allocated_amount || 0
                                                ).toLocaleString()}
                                              </div>
                                              <div className="text-sm text-gray-600">
                                                contributed
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </Tabs.Content>
                <Tabs.Content
                  value="completed"
                  className="p-4 rounded-b-md bg-white"
                >
                  {completedCollaborativeGoals.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No completed collaborative goals found.
                      </p>
                    </div>
                  ) : (
                    completedCollaborativeGoals.map((goal) => {
                      const daysLeft = getDaysLeft(goal.target_date);
                      const currentAmount = goal.current_amount || 0;
                      const calculatedProgress = Math.round(
                        (currentAmount / goal.amount) * 100
                      );

                      return (
                        <div
                          key={goal.goal_id}
                          className="p-4 bg-orange-50 rounded-lg mb-4"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <CategoryBadge category={goal.category} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-base leading-tight">
                                  {goal.title}
                                </h4>
                                {goal.participantCount > 1 && (
                                  <Badge variant="outline" className="text-xs">
                                    <Users className="w-3 h-3 mr-1" />
                                    {goal.participantCount} people
                                  </Badge>
                                )}
                                {goal.userRole && (
                                  <Badge
                                    variant={
                                      goal.userRole === "owner"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {goal.userRole}
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm text-gray-600 mt-1">
                                {daysLeft} Days Left ({formatDate(goal.target_date)}
                                )
                              </p>

                              {goal.description && (
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                  {goal.description}
                                </p>
                              )}
                            </div>
                            <StatusBadge status={goal.status} />
                          </div>

                          <div className="flex justify-between items-center mb-3 mt-4">
                            <span className="font-semibold text-base">
                              ${(currentAmount || 0).toLocaleString()}
                            </span>
                            <span className="text-gray-600 text-base font-medium">
                              ${(goal.amount || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className="bg-orange-500 h-3 rounded-full transition-all duration-300 ease-in-out"
                              style={{
                                width: `${Math.min(calculatedProgress, 100)}%`,
                              }}
                            />
                          </div>
                          <div className="text-right text-sm text-orange-500 font-medium mb-3">
                            {calculatedProgress}%
                          </div>

                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                Your contribution:
                              </span>
                              <span className="text-sm font-medium">
                                ${(goal.userAllocatedAmount || 0).toLocaleString()}
                              </span>
                            </div>

                            {/* Expandable Participants Section */}
                            {goal.participantCount > 1 && (
                              <div className="mt-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleGoalExpansion(goal.goal_id)}
                                  className="w-full text-sm text-gray-600 hover:text-gray-800 h-8"
                                >
                                  <span>View all participants</span>
                                  {expandedGoals.has(goal.goal_id) ? (
                                    <ChevronUp className="w-4 h-4 ml-1" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                  )}
                                </Button>

                                {expandedGoals.has(goal.goal_id) &&
                                  participants[goal.goal_id] && (
                                    <div className="mt-4 space-y-4">
                                      {participants[goal.goal_id].map(
                                        (participant) => (
                                          <div
                                            key={participant.user_id}
                                            className="flex items-center justify-between p-4 bg-orange-25 rounded-lg border border-orange-100"
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                <span className="text-orange-600 font-semibold text-lg">
                                                  {participant.user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                                </span>
                                              </div>
                                              <div className="flex flex-col">
                                                <span className="text-base font-semibold text-gray-800">
                                                  {participant.user.name}
                                                </span>
                                                <Badge
                                                  variant="secondary"
                                                  className="text-xs w-fit mt-1"
                                                >
                                                  {participant.role === "owner"
                                                    ? "👑 Owner"
                                                    : participant.role ===
                                                      "collaborator"
                                                    ? "🤝 Collaborator"
                                                    : "⏳ Pending"}
                                                </Badge>
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-lg font-bold text-gray-800">
                                                $
                                                {(
                                                  participant.allocated_amount || 0
                                                ).toLocaleString()}
                                              </div>
                                              <div className="text-sm text-gray-600">
                                                contributed
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </Tabs.Content>
              </Tabs.Root>
            </CardHeader>
          </Card>
        </div>

        {/* Right Side - Shows form when active, savings info when not */}
        <div className="lg:col-span-1">
          {showForm ? (
            <Card className="sticky top-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Add Goal</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowForm(false)}
                  className="rounded-full h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <AddGoalForm
                  onClose={() => setShowForm(false)}
                  onGoalCreated={handleGoalCreated}
                />
              </CardContent>
            </Card>
          ) : (

         <Card className="sticky top-4">
  <CardHeader>
    <CardTitle className="text-xl">Available Savings</CardTitle>
    <p className="text-sm text-gray-600">Total savings available for allocation</p>
    <p className="text-2xl font-bold text-orange-500">${(savingsData?.availableSavings)?.toFixed(2)}</p>

    {/* New Section */}
    <div className="mt-4">
      <p className="text-sm text-gray-600">Savings from last month</p>
      <p className="text-2xl font-bold text-blue-500">${(savingsData?.availableSavingsLastMonth)?.toFixed(2)}</p>
    </div>
  </CardHeader>

  <CardContent className="space-y-4">
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">
        You have savings ready to allocate to your goals. Click the button above to start allocating.
      </p>
      <Link href="/allocate">
        <Button className="bg-blue-500 hover:bg-blue-600">
          Go to Allocation Page
        </Button>
      </Link>
    </div>
  </CardContent>
</Card>


          )}
        </div>
      </div>
    </MainLayout>
  );
}
