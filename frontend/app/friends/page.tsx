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
import { Input } from "@/app/_components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import { Badge } from "@/app/_components/ui/badge";
import { Progress } from "@/app/_components/ui/progress";
import { Check, X, Search, Car, Heart } from "lucide-react";
import { ToastProvider, Toast, ToastViewport } from "@radix-ui/react-toast";

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [message, setMessage] = useState("");

  const [authToken, setAuthToken] = useState<string | null>(null);

  // Fetch friends with token
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5100/api/friends", {
          credentials: "include",
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Server response:", errorText);
          throw new Error("Server returned an error");
        }

        // Only parse as JSON if the content-type is application/json
        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          const errorText = await res.text();
          console.error("Expected JSON, got:", errorText);
          throw new Error("Server did not return JSON");
        }

        // if (!res.ok) throw new Error("Failed to fetch friends");

        const data = await res.json();
        console.log(data);

        setFriends(data);
      } catch (err) {
        setError(err.message || "Error loading friends");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]); // Re-run when token changes

  // Filter friends by search term
  const filteredFriends = friends.filter(
    (friend) =>
      friend.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add friend to selection
  const handleAddSelectedFriend = (friend) => {
    if (!selectedFriends.some((f) => f.user_id === friend.user_id)) {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  // Remove friend from selection
  const handleRemoveFriend = (user_id) => {
    setSelectedFriends(selectedFriends.filter((f) => f.user_id !== user_id));
  };

  // Submit selected friends to backend
  const handleAddFriend = async () => {
    try {
      const response = await fetch("http://localhost:5100/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Add this
        body: JSON.stringify(selectedFriends.map((f) => f.user_id)),
      });

      if (!response.ok) throw new Error("Failed to add friends");

      setMessage("Friends added successfully!");
      setSelectedFriends([]);

      // Refresh friends list
      const res = await fetch("http://localhost:5100/api/friends");
      setFriends(await res.json());
    } catch (err) {
      setMessage(err.message || "Error adding friends");
    }
  };

  // Loading state
  // if (loading) return <div>Loading friends...</div>;

  // Error state
  if (error) return <div>Error: {error}</div>;

  const acceptedFriends = friends.filter(
    (friend: Friend) => friend.status === "accepted"
  );

  const pendingFriends = friends.filter(
    (friend: Friend) => friend.status === "pending"
  );

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Friends Section */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Friends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {acceptedFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-orange-500 text-white">
                        {friend.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{friend.name}</h4>
                      <p className="text-sm text-gray-600">{friend.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-orange-200 text-orange-800"
                    >
                      {friend.relationship}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-600"
                    >
                      {friend.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Friend Requests */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Requests (1)</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingFriends.map((friend) => (
                <div
                  key={friend.user_id}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-orange-500 text-white">
                        {friend.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{friend.name}</h4>
                      <p className="text-sm text-gray-600">{friend.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-orange-200 text-orange-800"
                    >
                      {friend.relationship}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-600"
                    >
                      {friend.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Find New Friends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Find New Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search By Username"
                  className="pl-10 bg-teal-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="mt-4 space-y-2">
                {searchTerm &&
                  filteredFriends.map((friend) => (
                    <div
                      key={friend.user_id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <span>
                        {friend.name} (@{friend.username})
                      </span>
                      <button
                        onClick={() => handleAddSelectedFriend(friend)}
                        className="p-1 rounded-full hover:bg-teal-100"
                        title="Add friend"
                      >
                        <Check className="w-4 h-4 text-teal-600" />
                      </button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Friends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedFriends.map((friend) => (
                  <li
                    key={friend.user_id}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {friend.name} (@{friend.username})
                    </span>
                    <button
                      onClick={() => handleRemoveFriend(friend.userid)}
                      className="p-1 rounded-full hover:bg-red-100"
                      title="Remove friend"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </li>
                ))}
              </ul>
              {selectedFriends.length > 0 && (
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 mt-4"
                  onClick={handleAddFriend}
                >
                  Add Friend
                </Button>
              )}
              {message && (
                <div
                  className={`mt-2 text-sm ${
                    message.includes("success")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {message}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* ... rest of the code ... */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Collabs</CardTitle>
            </CardHeader>
            <CardContent>
              {/* {collaborations.map((collab) => (
                <div key={collab.id} className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{collab.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {collab.daysLeft} Days Left ({collab.date})
                  </p>

                  <div className="space-y-2 text-sm mb-3">
                    <div>Saving To Allocate: ${collab.savingToAllocate}</div>
                    <div>
                      Present Saving To Allocate (5%): ${collab.presentSaving}
                    </div>
                    <div>
                      Goal Amount: ${collab.goalAmount.toLocaleString()}
                    </div>
                  </div>

                  <Progress value={collab.progress} className="mb-3" />
                  <div className="text-right text-sm text-orange-500 mb-3">
                    +800 (60%)
                  </div>

                  <div className="space-y-2">
                    {collab.contributors.map((contributor, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium">{contributor.name}</span>
                        <span>
                          {contributor.calculation ||
                            `$${contributor.amount.toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span>Amount Left</span>
                      <span>${collab.amountLeft.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))} */}
            </CardContent>
          </Card>

          {/* Invitations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invitations (2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* {invitations.map((invitation) => (
                <div key={invitation.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                      {invitation.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{invitation.title}</h4>
                      <p className="text-sm text-gray-600">Category: {invitation.category}</p>
                      <p className="text-sm text-gray-600">Amount: ${invitation.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Target Date: {invitation.targetDate}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 flex-1">
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1">
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))} */}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
