"use client";
import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
  zoomPlugin
);

export default function Page() {
  const [data, setData] = useState([]);
  const [current, setCurrent] = useState({
    harorat: 0,
    havoNamligi: 0,
    tuproqNamligi: 0,
    yoruglik: 0,
    kislorod: 0,
    co2: 0,
  });
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());

      const newValues = {
        harorat: +(Math.random() * 40).toFixed(1),
        havoNamligi: +(Math.random() * 100).toFixed(1),
        tuproqNamligi: +(Math.random() * 100).toFixed(1),
        yoruglik: +(Math.random() * 10000).toFixed(0),
        kislorod: +(Math.random() * 30 + 60).toFixed(1),
        co2: +(Math.random() * 600 + 400).toFixed(0),
      };
      setCurrent(newValues);
      setData((prev) => [
        ...prev.slice(-49),
        { vaqt: now.toLocaleTimeString(), ...newValues },
      ]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const chartOptions = (label, color, unit) => ({
    responsive: true,
    maintainAspectRatio: false, // Important for responsiveness
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index" },
      zoom: {
        zoom: { wheel: { enabled: true }, mode: "x" },
        pan: { enabled: true, mode: "x" },
      },
    },
    scales: {
      x: { 
        ticks: { 
          color: "#00ff99",
          maxTicksLimit: 5, // Reduce number of ticks on small screens
        } 
      },
      y: {
        ticks: {
          color: "#00ff99",
          callback: (v) => v + " " + unit,
          maxTicksLimit: 5, // Reduce number of ticks on small screens
        },
      },
    },
  });

  const makeDataset = (key, label, color) => ({
    labels: data.map((d) => d.vaqt),
    datasets: [
      {
        label,
        data: data.map((d) => d[key]),
        borderColor: color,
        backgroundColor: "transparent",
        tension: 0.3,
        pointRadius: 2, // Smaller points on small screens
      },
    ],
  });

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Smart GardeenHouse</h1>
        <span className="time">{time}</span>
      </div>

      <div className="cards">
        {Object.entries(current).map(([key, value]) => (
          <div className="card" key={key}>
            <h3>
              {key === "harorat" ? "Harorat" :
              key === "havoNamligi" ? "Havo namligi" :
              key === "tuproqNamligi" ? "Tuproq namligi" :
              key === "yoruglik" ? "Yorug'lik" :
              key === "kislorod" ? "Kislorod" : "CO₂"}
            </h3>
            <p>
              {value}{" "}
              {key === "harorat" ? "°C" :
              key === "havoNamligi" ? "%" :
              key === "tuproqNamligi" ? "%" :
              key === "yoruglik" ? "lux" :
              key === "kislorod" ? "%" : "ppm"}
            </p>
          </div>
        ))}
      </div>

      <div className="charts">
        <div className="chartBox">
          <h3>Harorat (°C)</h3>
          <div className="chart-container">
            <Line data={makeDataset("harorat", "Harorat", "#00ff99")} options={chartOptions("Harorat", "#00ff99", "°C")} />
          </div>
        </div>
        <div className="chartBox">
          <h3>Havo namligi (%)</h3>
          <div className="chart-container">
            <Line data={makeDataset("havoNamligi", "Havo namligi", "#66ffb2")} options={chartOptions("Havo namligi", "#66ffb2", "%")} />
          </div>
        </div>
        <div className="chartBox">
          <h3>Tuproq namligi (%)</h3>
          <div className="chart-container">
            <Line data={makeDataset("tuproqNamligi", "Tuproq namligi", "#33cc99")} options={chartOptions("Tuproq namligi", "#33cc99", "%")} />
          </div>
        </div>
        <div className="chartBox">
          <h3>Yorug'lik (lux)</h3>
          <div className="chart-container">
            <Line data={makeDataset("yoruglik", "Yorug'lik", "#99ffcc")} options={chartOptions("Yorug'lik", "#99ffcc", "lux")} />
          </div>
        </div>

        {/* Kislorod pie */}
        <div className="chartBox">
          <h3>Kislorod miqdori (%)</h3>
          <div className="chart-container">
            <Pie
              data={{
                labels: ["Kislorod", "Boshqa gazlar"],
                datasets: [
                  {
                    data: [current.kislorod, 100 - current.kislorod],
                    backgroundColor: ["#00ff99", "#333"],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* CO2 pie */}
        <div className="chartBox">
          <h3>CO₂ miqdori (ppm)</h3>
          <div className="chart-container">
            <Pie
              data={{
                labels: ["CO₂", "Boshqa"],
                datasets: [
                  {
                    data: [current.co2 / 10, 100 - current.co2 / 10],
                    backgroundColor: ["#66ffb2", "#333"],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}