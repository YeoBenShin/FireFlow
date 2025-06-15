import { MainLayout } from "../_components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { Badge } from "@/app/_components/ui/badge"
import { Progress } from "@/app/_components/ui/progress"
import { Check, X, Search, Car, Heart } from "lucide-react"

export default function FriendsPage() {
  const friends = [
    {
      id: "1",
      name: "Yeo Ben Shin",
      username: "@benshin01",
      avatar: "/placeholder.svg?height=40&width=40",
      relationship: "Colleagues",
      status: "online",
    },
    {
      id: "2",
      name: "Easan Saravan",
      username: "@easan7",
      avatar: "/placeholder.svg?height=40&width=40",
      relationship: "Housemates",
      status: "Cousins",
    },
    {
      id: "3",
      name: "Chong Wei Choon",
      username: "@chongwc",
      avatar: "/placeholder.svg?height=40&width=40",
      relationship: "Housemates",
      status: "Cousins",
    },
    {
      id: "4",
      name: "Liau Jun Rong",
      username: "@junrong2",
      avatar: "/placeholder.svg?height=40&width=40",
      relationship: "Housemates",
      status: "Cousins",
    },
  ]

  const friendRequests = [
    {
      id: "1",
      name: "Newbie",
      username: "@new",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const collaborations = [
    {
      id: "1",
      title: "Korea Trip",
      daysLeft: 20,
      date: "31 May 2025",
      savingToAllocate: 800,
      presentSaving: 500,
      goalAmount: 4000,
      contributors: [
        { name: "Ben", amount: 1000, calculation: "$1,000.00 + $800.00 = $1,800.00" },
        { name: "Weichoon", amount: 1000 },
      ],
      amountLeft: 1200,
      progress: 60,
    },
  ]

  const invitations = [
    {
      id: "1",
      title: "Wedding Ceremony",
      category: "Wedding",
      amount: 35000,
      targetDate: "July 24, 2026",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: "2",
      title: "Red Tesla",
      category: "Car",
      amount: 35000,
      targetDate: "June 8, 2026",
      icon: <Car className="w-5 h-5" />,
    },
  ]

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
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
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
                    <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                      {friend.relationship}
                    </Badge>
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
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
              {friendRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-orange-500 text-white">
                        {request.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{request.name}</h4>
                      <p className="text-sm text-gray-600">{request.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <X className="w-4 h-4" />
                    </Button>
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
                <Input placeholder="Search By Username" className="pl-10 bg-teal-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collabs and Invitations */}
        <div className="space-y-6">
          {/* Collabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl underline">Collabs</CardTitle>
            </CardHeader>
            <CardContent>
              {collaborations.map((collab) => (
                <div key={collab.id} className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{collab.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {collab.daysLeft} Days Left ({collab.date})
                  </p>

                  <div className="space-y-2 text-sm mb-3">
                    <div>Saving To Allocate: ${collab.savingToAllocate}</div>
                    <div>Present Saving To Allocate (5%): ${collab.presentSaving}</div>
                    <div>Goal Amount: ${collab.goalAmount.toLocaleString()}</div>
                  </div>

                  <Progress value={collab.progress} className="mb-3" />
                  <div className="text-right text-sm text-orange-500 mb-3">+800 (60%)</div>

                  <div className="space-y-2">
                    {collab.contributors.map((contributor, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium">{contributor.name}</span>
                        <span>{contributor.calculation || `$${contributor.amount.toLocaleString()}`}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span>Amount Left</span>
                      <span>${collab.amountLeft.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Invitations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invitations (2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invitations.map((invitation) => (
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
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
