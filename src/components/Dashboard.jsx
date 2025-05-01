import React, { useEffect, useState } from 'react';
import { Pie, Bar, Line, Doughnut, PolarArea } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

const Dashboard = () => {
  const [data, setData] = useState([]);

  const getdata = async () => {
    const res = await fetch("/eve_array.json");
    const data = await res.json();
    setData(data);
    console.log(data);
  }

  useEffect(() => {
    getdata();
  }, []);

  if (!data.length) return <div className="text-center text-white mt-20">Loading...</div>;

  const categories = {};
  const srcIPs = {};
  const timestamps = {};
  const ports = {};
  const severityLevels = { 1: 0, 2: 0, 3: 0 };

  const latestAlerts = data.slice(-20).reverse();

  data.forEach(item => {
    if (item.alert) {
      const category = item.alert.category;
      const srcIP = item.src_ip;
      const port = item.dest_port;
      const severity = item.alert.severity;
      const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      categories[category] = (categories[category] || 0) + 1;
      srcIPs[srcIP] = (srcIPs[srcIP] || 0) + 1;
      ports[port] = (ports[port] || 0) + 1;
      severityLevels[severity] = (severityLevels[severity] || 0) + 1;
      timestamps[time] = (timestamps[time] || 0) + 1;
    }
  });

  const sortedSrcIPs = Object.entries(srcIPs).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const sortedPorts = Object.entries(ports).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: 'white' },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const dataset = tooltipItem.dataset;
            const currentValue = dataset.data[tooltipItem.dataIndex];
            const total = dataset.data.reduce((sum, value) => sum + value, 0);
            const percentage = ((currentValue / total) * 100).toFixed(2);
            return `${tooltipItem.label}: ${currentValue} (${percentage}%)`;
          },
        },
      },
      datalabels: {

        display: false,
      },
    },
  };

  const pieChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      datalabels: {
        display: true,
        formatter: function (value, context) {
          const dataset = context.chart.data.datasets[context.datasetIndex];
          const total = dataset.data.reduce((sum, value) => sum + value, 0);
          const percentage = ((value / total) * 100).toFixed(2);
          return `${percentage}%`;
        },
        color: 'white',
        font: {
          weight: 'bold',
        },
        anchor: 'center', // Positioning the label at the center of the segment
        align: 'center',  // Aligning the label in the center
        offset: 10, // Adjusting the distance of the label from the center
      },
    },
  };
  

  return (
    <div className="min-h-screen  bg-gray-900 p-6">
      <h1 className="text-3xl text-center text-cyan-400 mb-10 font-bold">🚨 Network Alerts Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pie chart for categories */}
        <div className="relative bg-gray-800 rounded-2xl p-4 shadow-md">
          <h3 className="text-center text-white font-bold mb-2">Alert Categories</h3>
          <Pie
            data={{
              labels: Object.keys(categories),
              datasets: [
                {
                  data: Object.values(categories),
                  backgroundColor: ['#f43f5e', '#3b82f6', '#facc15', '#22c55e', '#a855f7'],
                },
              ],
            }}
            options={pieChartOptions}
          />
        </div>

        {/* Bar chart for source IPs */}
        <div className="relative bg-gray-800 rounded-2xl p-4 shadow-md">
          <h3 className="text-center text-white font-bold mb-2">Top Source IPs</h3>
          <Bar
            data={{
              labels: sortedSrcIPs.map(ip => ip[0]),
              datasets: [
                {
                  label: 'Top Source IPs',
                  data: sortedSrcIPs.map(ip => ip[1]),
                  backgroundColor: '#06b6d4',
                },
              ],
            }}
            options={chartOptions}
          />
        </div>

        {/* Line chart for alerts over time */}
        <div className="relative bg-gray-800 rounded-2xl p-4 shadow-md">
          <h3 className="text-center text-white font-bold mb-2">Alerts Over Time</h3>
          <Line
            data={{
              labels: Object.keys(timestamps),
              datasets: [
                {
                  label: 'Alerts Over Time',
                  data: Object.values(timestamps),
                  borderColor: '#4ade80',
                  backgroundColor: 'rgba(74,222,128,0.2)',
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>

        {/* Doughnut chart for severity levels */}
        <div className="relative bg-gray-800 rounded-2xl p-4 shadow-md">
          <h3 className="text-center text-white font-bold mb-2">Severity Levels</h3>
          <Doughnut
            data={{
              labels: ['Severity 1', 'Severity 2', 'Severity 3'],
              datasets: [
                {
                  data: Object.values(severityLevels),
                  backgroundColor: ['#ec4899', '#8b5cf6', '#3b82f6'],
                },
              ],
            }}
            options={pieChartOptions}
          />

        </div>

        {/* Polar Area chart for ports */}
        <div className="relative bg-gray-800 rounded-2xl p-4 shadow-md">
          <h3 className="text-center text-white font-bold mb-2">Top Destination Ports</h3>
          <PolarArea
            data={{
              labels: sortedPorts.map(p => p[0]),
              datasets: [
                {
                  data: sortedPorts.map(p => p[1]),
                
                  backgroundColor: ['#fb923c', '#84cc16', '#facc15', '#0ea5e9', '#9ca3af', '#f97316'],  
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      </div>


      <h2 className="text-2xl text-white mt-10 mb-4">Latest Alerts</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-400">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-2">Timestamp</th>
              <th className="p-2">Source IP</th>
              <th className="p-2">Destination IP</th>
              <th className="p-2">Signature</th>
              <th className="p-2">Category</th>
              <th className="p-2">Severity</th>
            </tr>
          </thead>
          <tbody>
            {latestAlerts.map((alert, idx) => (
              <tr key={idx} className="odd:bg-gray-800 even:bg-gray-700">
                <td className="p-2">{alert.timestamp}</td>
                <td className="p-2">{alert.src_ip}</td>
                <td className="p-2">{alert.dest_ip}</td>
                <td className="p-2">{alert.alert?.signature || "N/A"}</td>
                <td className="p-2">{alert.alert?.category || "N/A"}</td>
                <td className="p-2">{alert.alert?.severity || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
