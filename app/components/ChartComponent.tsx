import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartComponentProps {
  ppgData: number[];
  valleys: { index: number; value: number }[];
}

export default function ChartComponent({
  ppgData,
  valleys,
}: ChartComponentProps) {
  const chartData = {
    labels: Array.from({ length: ppgData.length }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'PPG Signal',
        data: ppgData,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        pointRadius: 0,
      },
      {
        label: 'Valleys',
        data: ppgData.map(
          (_, i) => valleys.find((v) => v.index === i)?.value || null
        ),
        pointBackgroundColor: 'red',
        pointRadius: 3,
        showLine: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
      },
    },
    animation: {
      duration: 0, // Disable animation for better performance
    },
  };

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-md border-2 border-green-200" // Light green border
      style={{ color: '#15803d' }} // Dark green text color
    >
      <h2 className="text-lg font-semibold mb-2 text-green-700">PPG Signal</h2> {/* Dark green title */}
      <div style={{ height: '300px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}