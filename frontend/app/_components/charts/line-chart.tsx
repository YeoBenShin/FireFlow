"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export interface LineChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
      fill?: boolean
    }[]
  }
  title?: string
}

export function LineChart({ data, title }: LineChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => "$" + value.toLocaleString(),
        },
      },
    },
  }

  return (
    <div className="w-full h-80">
      <Line data={data} options={options} />
    </div>
  )
}
