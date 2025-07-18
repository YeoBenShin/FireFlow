import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip"

import { Info } from "lucide-react"

interface ExpenseCardProps {
  amount: string
  title: string
}

export function ExpenseCard({ amount, title }: ExpenseCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-600 font-medium">{title}</span>
         <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent className = "text-white px-3 py-2 text-xs" side="top" align="start"
             style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}>
              {title === "Today's Expenditure" ? <p>
                This shows your total expenses for today,
              </p> : <p>
               This shows your remaining budget for the day. This is calculated
               by <br/> subtracting your total expenses so far this month, together with the amount<br/>
               you want to save for the month, from your total income. This is then<br/>
              divided by the number of days left in the month to give you a daily budget<br/>
              </p> }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="text-3xl font-bold text-gray-800">${amount.toLocaleString()}</div>
    </div>
  )
}
