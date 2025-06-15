import { MainLayout } from "../../components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Briefcase, GraduationCap, TrendingUp, Gift, Home, Calendar } from "lucide-react"

const incomeCategories = [
  { id: "salary", name: "Salary", icon: <DollarSign className="w-8 h-8" />, color: "bg-green-500" },
  { id: "freelance", name: "Freelance", icon: <Briefcase className="w-8 h-8" />, color: "bg-green-400" },
  { id: "tutoring", name: "Tutoring", icon: <GraduationCap className="w-8 h-8" />, color: "bg-green-300" },
  { id: "investment", name: "Investment", icon: <TrendingUp className="w-8 h-8" />, color: "bg-green-400" },
  { id: "bonus", name: "Bonus", icon: <Gift className="w-8 h-8" />, color: "bg-green-400" },
  { id: "rental", name: "Rental", icon: <Home className="w-8 h-8" />, color: "bg-green-300" },
]

export default function AddIncomePage() {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income Categories */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Income Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {incomeCategories.map((category) => (
                  <button
                    key={category.id}
                    className={`${category.color} text-white p-6 rounded-2xl flex flex-col items-center gap-3 hover:opacity-90 transition-opacity`}
                  >
                    {category.icon}
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>

              <div className="text-center">
                <Button className="bg-orange-500 hover:bg-orange-600">Add Income</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Income Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Add Income</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Input id="date" defaultValue="April 30, 2024" className="bg-orange-50" />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500" />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger className="bg-teal-50">
                    <SelectValue placeholder="Select The Category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" placeholder="$0.00" className="bg-teal-50" />
              </div>

              <div>
                <Label htmlFor="title">Income Title</Label>
                <Input id="title" placeholder="Income source" className="bg-teal-50" />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Enter Message" className="bg-teal-50 min-h-[120px] resize-none" />
              </div>

              <Button className="w-full bg-orange-500 hover:bg-orange-600 mt-6">Save</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
