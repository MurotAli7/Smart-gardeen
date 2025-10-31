"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});
const Pie = dynamic(() => import("react-chartjs-2").then((mod) => mod.Pie), {
  ssr: false,
});

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
  const [isClient, setIsClient] = useState(false);
  const chartRefs = useRef({});

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== "undefined") {
      const initializeCharts = async () => {
        const {
          Chart: ChartJS,
          LineElement,
          CategoryScale,
          LinearScale,
          PointElement,
          Tooltip,
          Legend,
          ArcElement,
        } = await import("chart.js");
        const zoomPlugin = await import("chartjs-plugin-zoom");

        ChartJS.register(
          LineElement,
          CategoryScale,
          LinearScale,
          PointElement,
          Tooltip,
          Legend,
          ArcElement,
          zoomPlugin.default
        );
      };

      initializeCharts();
    }

    const initialData = [];
    const now = new Date();
    for (let i = 49; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3000);
      initialData.push({
        vaqt: time.toLocaleTimeString(),
        harorat: 25,
        havoNamligi: 50,
        tuproqNamligi: 60,
        yoruglik: 5000,
        kislorod: 78,
        co2: 450,
      });
    }
    setData(initialData);
    setCurrent(initialData[49]);

    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());

      const newValues = {
        harorat: +(25 + Math.random() * 10 - 5).toFixed(1), // 20-30 oralig'ida
        havoNamligi: +(50 + Math.random() * 20 - 10).toFixed(1), // 40-60 oralig'ida
        tuproqNamligi: +(60 + Math.random() * 20 - 10).toFixed(1), // 50-70 oralig'ida
        yoruglik: +(5000 + Math.random() * 2000 - 1000).toFixed(0), // 4000-6000 oralig'ida
        kislorod: +(78 + Math.random() * 4 - 2).toFixed(1), // 76-80 oralig'ida
        co2: +(450 + Math.random() * 100 - 50).toFixed(0), // 400-500 oralig'ida
      };
      
      setCurrent(newValues);
      setData((prev) => {
        const newData = [...prev.slice(1), { vaqt: now.toLocaleTimeString(), ...newValues }];
        return newData;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const chartOptions = (label, color, unit, minY, maxY) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        mode: "index",
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#00ff99',
        bodyColor: '#99ffcc',
        borderColor: '#00ff99',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} ${unit}`;
          }
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          pinch: {
            enabled: true
          },
          mode: 'x',
          drag: {
            enabled: true,
            backgroundColor: 'rgba(0, 255, 153, 0.3)',
            borderColor: '#00ff99',
            borderWidth: 1
          },
        },
        limits: {
          x: { min: 'original', max: 'original' },
          y: { min: 'original', max: 'original' }
        }
      },
    },
    scales: {
      x: { 
        type: 'category',
        ticks: { 
          color: "#00ff99",
          maxTicksLimit: 8,
          maxRotation: 0,
          callback: function(value, index, values) {
            // Faqat har 5-chi labelni ko'rsatish
            return index % 5 === 0 ? this.getLabelForValue(value) : '';
          }
        },
        grid: {
          color: 'rgba(0, 255, 153, 0.1)',
          drawBorder: true,
          borderColor: '#00ff99'
        },
        title: {
          display: true,
          text: 'Vaqt',
          color: '#99ffcc'
        }
      },
      y: {
        min: minY,
        max: maxY,
        ticks: {
          color: "#00ff99",
          callback: (v) => v + " " + unit,
          maxTicksLimit: 8,
        },
        grid: {
          color: 'rgba(0, 255, 153, 0.1)',
          drawBorder: true,
          borderColor: '#00ff99'
        },
        title: {
          display: true,
          text: unit,
          color: '#99ffcc'
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        radius: 0, // Nuqtalarni ko'rsatmaslik
        hoverRadius: 6,
        hoverBackgroundColor: '#00ff99'
      },
      line: {
        tension: 0.4 // Silliq chiziq
      }
    },
    animation: {
      duration: 0 // Yangi ma'lumot qo'shilganda animatsiyasiz
    },
    transitions: {
      zoom: {
        animation: {
          duration: 0
        }
      }
    }
  });

  const makeDataset = (key, label, color) => ({
    labels: data.map((d) => d.vaqt),
    datasets: [
      {
        label,
        data: data.map((d) => d[key]),
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  });

  // Zoom reset funksiyasi
  const resetZoom = (chartId) => {
    if (chartRefs.current[chartId]) {
      chartRefs.current[chartId].resetZoom();
    }
  };

  if (!isClient) {
    return (
      <div className="dashboard">
        <div className="header">
          <h1>Smart GardeenHouse</h1>
          <span className="time">Loading...</span>
        </div>
        <div className="cards">
          {Object.keys(current).map((key) => (
            <div className="card" key={key}>
              <h3>
                {key === "harorat" ? "Harorat" :
                key === "havoNamligi" ? "Havo namligi" :
                key === "tuproqNamligi" ? "Tuproq namligi" :
                key === "yoruglik" ? "Yorug'lik" :
                key === "kislorod" ? "Kislorod" : "CO₂"}
              </h3>
              <p>---</p>
            </div>
          ))}
        </div>
        <div className="charts">
          {[...Array(6)].map((_, index) => (
            <div className="chartBox" key={index}>
              <h3>Loading...</h3>
              <div className="chart-container">
                <div className="chart-loading">Chart loading...</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
          <div className="chart-header">
            <h3>Harorat (°C)</h3>
            <button className="reset-btn" onClick={() => resetZoom('harorat')}>Zoom Reset</button>
          </div>
          <div className="chart-container">
            <Line 
              ref={(ref) => chartRefs.current.harorat = ref}
              data={makeDataset("harorat", "Harorat", "#00ff99")} 
              options={chartOptions("Harorat", "#00ff99", "°C", 15, 35)} 
            />
          </div>
        </div>

        <div className="chartBox">
          <div className="chart-header">
            <h3>Havo namligi (%)</h3>
            <button className="reset-btn" onClick={() => resetZoom('havoNamligi')}>Zoom Reset</button>
          </div>
          <div className="chart-container">
            <Line 
              ref={(ref) => chartRefs.current.havoNamligi = ref}
              data={makeDataset("havoNamligi", "Havo namligi", "#66ffb2")} 
              options={chartOptions("Havo namligi", "#66ffb2", "%", 30, 70)} 
            />
          </div>
        </div>

        <div className="chartBox">
          <div className="chart-header">
            <h3>Tuproq namligi (%)</h3>
            <button className="reset-btn" onClick={() => resetZoom('tuproqNamligi')}>Zoom Reset</button>
          </div>
          <div className="chart-container">
            <Line 
              ref={(ref) => chartRefs.current.tuproqNamligi = ref}
              data={makeDataset("tuproqNamligi", "Tuproq namligi", "#33cc99")} 
              options={chartOptions("Tuproq namligi", "#33cc99", "%", 40, 80)} 
            />
          </div>
        </div>

        <div className="chartBox">
          <div className="chart-header">
            <h3>Yorug'lik (lux)</h3>
            <button className="reset-btn" onClick={() => resetZoom('yoruglik')}>Zoom Reset</button>
          </div>
          <div className="chart-container">
            <Line 
              ref={(ref) => chartRefs.current.yoruglik = ref}
              data={makeDataset("yoruglik", "Yorug'lik", "#99ffcc")} 
              options={chartOptions("Yorug'lik", "#99ffcc", "lux", 3000, 7000)} 
            />
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
                    borderColor: '#00ff99'
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#00ff99',
                      padding: 20
                    }
                  }
                }
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
                    borderColor: '#00ff99'
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#00ff99',
                      padding: 20
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}