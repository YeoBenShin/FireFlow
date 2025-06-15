"use client"

import { useRef } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

interface DonutChartProps {
  data: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
      borderWidth: number
    }[]
  }
  centerText?: {
    title: string
    value: string
  }
}

export function DonutChart({ data, centerText }: DonutChartProps) {
  const chartRef = useRef<ChartJS<"doughnut">>(null)

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.parsed
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: $${value.toLocaleString()} (${percentage}%)`
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
  }

  // Custom plugin to draw center text
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart: ChartJS<"doughnut">) => {
      if (!centerText) return

      const { ctx, width, height } = chart
      ctx.restore()

      const fontSize = Math.min(width, height) / 12
      ctx.font = `bold ${fontSize}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const centerX = width / 2
      const centerY = height / 2

      // Draw title
      ctx.fillStyle = "#6B7280"
      ctx.font = `${fontSize * 0.6}px Arial`
      ctx.fillText(centerText.title, centerX, centerY - fontSize * 0.4)

      // Draw value
      ctx.fillStyle = "#1F2937"
      ctx.font = `bold ${fontSize}px Arial`
      ctx.fillText(centerText.value, centerX, centerY + fontSize * 0.4)

      ctx.save()
    },
  }

  return (
    <div className="relative w-64 h-64 mx-auto">
      <Doughnut ref={chartRef} data={data} options={options} plugins={[centerTextPlugin]} />
    </div>
  )
}
