import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HealthMetricsProps {
  data: {
    labels: string[];
    values: number[];
    label: string;
    color: string;
  };
}

export const HealthMetrics = ({ data }: HealthMetricsProps) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: data.label,
        data: data.values,
        borderColor: data.color,
        backgroundColor: `${data.color}33`,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: data.label,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div className="w-full h-[200px] bg-card/50 backdrop-blur-sm rounded-lg p-4">
      <Line data={chartData} options={options} />
    </div>
  );
}; 