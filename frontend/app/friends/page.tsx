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
import { Check, X, Search } from "lucide-react";
import {
  ToastProvider,
  Toast,
  ToastViewport,
  ToastTitle,
} from "@radix-ui/react-toast";

export default function FriendsPage() {
  // Data states
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [users, setUsers] = useState([]);

  // UI states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Toast helpers
  const addToast = (message, type = "info") => {
    setToasts((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        message,
        type,
        open: true,
      },
    ]);
  };
  const handleOpenChange = (id, open) => {
    if (!open) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Fetch helpers
  const fetchFriends = async () => {
    try {
      const res = await fetch(`http://localhost:5100/api/friends?_t=${Date.now()}`, {
        credentials: "include",
        cache: "no-store"
      });
      if (!res.ok) throw new Error("Failed to fetch friends");
      const data = await res.json();
      console.log("[DEBUG] Friends data:", data);
      setFriends(data);
    } catch (err) {
      console.error("[ERROR] fetchFriends:", err);
      setError(err.message || "Failed to load friends");
    }
  };
  const fetchSentRequests = async () => {
    try {
      const res = await fetch(
        `http://localhost:5100/api/friends/requests?toAccept=false&_t=${Date.now()}`,
        { 
          credentials: "include",
          cache: "no-store"
        }
      );
      if (!res.ok) throw new Error("Failed to fetch sent requests");
      const data = await res.json();
      console.log("[DEBUG] Sent requests data:", data);
      setSentRequests(data);
    } catch (err) {
      console.error("[ERROR] fetchSentRequests:", err);
      setError(err.message || "Failed to load sent requests");
    }
  };
  const fetchReceivedRequests = async () => {
    try {
      const res = await fetch(
        `http://localhost:5100/api/friends/requests?toAccept=true&_t=${Date.now()}`,
        { 
          credentials: "include",
          cache: "no-store"
        }
      );
      if (!res.ok) throw new Error("Failed to fetch received requests");
      const data = await res.json();
      console.log("[DEBUG] Received requests data:", data);
      setReceivedRequests(data);
    } catch (err) {
      console.error("[ERROR] fetchReceivedRequests:", err);
      setError(err.message || "Failed to load received requests");
    }
  };

  // Fetch all on mount
  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchFriends(),
      fetchSentRequests(),
      fetchReceivedRequests(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line
  }, []);

  // Debounced user search
  useEffect(() => {
    if (!searchTerm) {
      setUsers([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setUsersLoading(true);
      try {
        const res = await fetch("http://localhost:5100/api/users/filter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username: searchTerm }),
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message || "Failed to load users");
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Filter users not already friends or selected
  const friendIds = new Set(friends.map((f) => f.username));
  const selectedIds = new Set(selectedFriends.map((f) => f.username));
  const filteredUsers = users.filter(
    (user) => !friendIds.has(user.username) && !selectedIds.has(user.username)
  );

  // Add friend to selection
  const handleAddSelectedFriend = (friend) => {
    if (!selectedFriends.some((f) => f.username === friend.username)) {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  // Remove friend from selection
  const handleRemoveFriend = (username) => {
    setSelectedFriends(selectedFriends.filter((f) => f.username !== username));
  };

  // API call for actions
  const callAPI = async (path, username, method, successMsg = "", errorMsg = "") => {
    try {
      const response = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        addToast(errorMsg || "Failed", "error");
        return false;
      }
      if (successMsg) addToast(successMsg, "success");
      return true;
    } catch (err) {
      addToast(errorMsg || "Failed", "error");
      return false;
    }
  };

  // Handlers for friend actions
  const handleAccept = async (username) => {
    const ok = await callAPI(
      "http://localhost:5100/api/friends/accept",
      username,
      "POST",
      "Friend request accepted!",
      "Failed to accept friend request"
    );
    if (ok) await refreshAll();
  };

  const handleIgnore = async (username) => {
    const ok = await callAPI(
      "http://localhost:5100/api/friends/reject",
      username,
      "POST",
      "Friend request ignored.",
      "Failed to ignore friend request"
    );
    if (ok) await refreshAll();
  };

  const handleRemoveExistingFriend = async (username) => {
    const ok = await callAPI(
      "http://localhost:5100/api/friends/delete",
      username,
      "DELETE",
      "Friend removed successfully!",
      "Failed to remove friend"
    );
    if (ok) await refreshAll();
  };

  // Cancel sent request
  const handleCancelSentRequest = async (username) => {
    const ok = await callAPI(
      "http://localhost:5100/api/friends/cancel",
      username,
      "POST",
      "Friend request cancelled.",
      "Failed to cancel friend request"
    );
    if (ok) await refreshAll();
  };

  // Add multiple selected friends
  const handleAddFriend = async () => {
    if (selectedFriends.length === 0) {
      addToast("No friends selected to add.", "info");
      return;
    }
    setLoading(true);
    let successCount = 0;
    let errorMessages = [];
    for (const friend of selectedFriends) {
      try {
        const res = await fetch("http://localhost:5100/api/friends/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username: friend.username }),
        });
        if (!res.ok) {
          const errorText = await res.text();
          errorMessages.push(
            `Failed to add ${friend.username}: ${errorText || "Unknown error"}`
          );
        } else {
          successCount++;
        }
      } catch (err) {
        errorMessages.push(
          `Failed to add ${friend.username}: ${err.message || "Unknown error"}`
        );
      }
    }
    
    // Always refresh data after attempting to send requests
    await refreshAll();
    setSelectedFriends([]);
    
    if (successCount > 0) {
      addToast(
        `${successCount} friend${successCount > 1 ? "s" : ""} successfully added!`,
        "success"
      );
    }
    if (errorMessages.length > 0) {
      addToast(`Some errors occurred:\n${errorMessages.join("\n")}`, "error");
    }
    setLoading(false);
  };

  // Friends with status "accepted"
  const acceptedFriends = friends.filter(
    (friendObj) => friendObj.friend[0].status === "accepted"
  );

  // UI
  return (
    <ToastProvider swipeDirection="right">
      <MainLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Friends Section */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Friends ({acceptedFriends.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {acceptedFriends.length === 0 && <div className="text-gray-500">No friends yet.</div>}
                {acceptedFriends.map((friendObj) => (
                  <div
                    key={friendObj.username}
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={friendObj.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback className="bg-orange-500 text-white">
                          {(friendObj.name || friendObj.username)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{friendObj.name}</h4>
                        <p className="text-sm text-gray-600">
                          {friendObj.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {friendObj.friend.map((detail, idx) => (
                          <span key={idx} className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-orange-200 text-orange-800"
                            >
                              {detail.relationship}
                            </Badge>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveExistingFriend(friendObj.username)
                        }
                        className="p-1 rounded-full hover:bg-red-100"
                        title="Remove existing friend"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sent Requests */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  Sent Requests ({sentRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sentRequests.length === 0 && <div className="text-gray-500">No sent requests.</div>}
                {sentRequests.map((friendObj) => (
                  <div
                    key={friendObj.user.username}
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={friendObj.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback className="bg-orange-500 text-white">
                          {(friendObj.user.name || friendObj.user.username)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{friendObj.user.name}</h4>
                        <p className="text-sm text-gray-600">
                          {friendObj.user.username}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCancelSentRequest(friendObj.user.username)}
                      className="p-1 rounded-full hover:bg-red-100"
                      title="Cancel sent request"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
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
                  {usersLoading && <div>Loading...</div>}
                  {!usersLoading &&
                    searchTerm &&
                    filteredUsers.length === 0 && <div>No users found.</div>}
                  {!usersLoading &&
                    filteredUsers.map((user) => (
                      <div
                        key={user.username}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <span>
                          {user.name} (@{user.username})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddSelectedFriend(user)}
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
                      key={friend.username}
                      className="flex items-center justify-between"
                    >
                      <span>
                        {friend.name} (@{friend.username})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFriend(friend.username)}
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
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Friend"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: Invitations, Collabs, etc. */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Collabs</CardTitle>
              </CardHeader>
              <CardContent>
                {/* ...collaborations section... */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Invitations ({receivedRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {receivedRequests.length === 0 && <div className="text-gray-500">No invitations.</div>}
                {receivedRequests.map((friendObj) => (
                  <div
                    key={friendObj.user.username}
                    className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={friendObj.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback className="bg-orange-500 text-white">
                          {(friendObj.user.name || friendObj.user.username)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{friendObj.user.name}</h4>
                        <p className="text-sm text-gray-600">
                          {friendObj.user.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAccept(friendObj.user.username)}
                        className="px-3 py-1 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleIgnore(friendObj.user.username)}
                        className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Toasts */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            open={toast.open}
            onOpenChange={(open) => handleOpenChange(toast.id, open)}
            duration={3500}
            className={`
              flex flex-col gap-1
              px-6 py-4
              rounded-lg shadow-lg
              max-w-xs w-full
              border
              ${toast.type === "success" ? "bg-green-600 border-green-700 text-white" : ""}
              ${toast.type === "error" ? "bg-red-600 border-red-700 text-white" : ""}
              ${toast.type === "info" ? "bg-blue-600 border-blue-700 text-white" : ""}
              transition-all
            `}
          >
            <ToastTitle className="font-bold text-base mb-1">
              {toast.type === "success" && "Success"}
              {toast.type === "error" && "Failed"}
              {toast.type === "info" && "Info"}
            </ToastTitle>
            <div className="whitespace-pre-line text-sm">{toast.message}</div>
          </Toast>
        ))}
        <ToastViewport
          className="
            fixed bottom-6 right-6
            flex flex-col items-end gap-4
            z-[9999]
            w-auto max-w-xs
          "
        />
        {/* Error banner (non-blocking) */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 text-red-800 px-4 py-2 rounded shadow z-[9999]">
            {error}
            <button
              className="ml-2 text-red-800 hover:underline"
              onClick={() => setError("")}
            >
              Dismiss
            </button>
          </div>
        )}
      </MainLayout>
    </ToastProvider>
  );
}
