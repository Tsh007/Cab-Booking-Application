"use client";

import React, { useState } from "react";
import { bookingData } from "@/data/data"; // Import your JSON data
import dayjs from "dayjs";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Page: React.FC = () => {
  const [view, setView] = useState<string>("monthly"); // Default timeframe view
  const [graphType, setGraphType] = useState<string>("rides"); // Default graph view

  // Calculate average taxi price
  const calculateAverage = (timeframe: string) => {
    const now = dayjs();
    const filteredData = bookingData.BOOKDATA.filter((booking) => {
      const pickupDate = dayjs(booking.pickup_date);
      if (timeframe === "weekly") {
        return pickupDate.isAfter(now.subtract(1, "week"));
      } else if (timeframe === "monthly") {
        return pickupDate.isAfter(now.subtract(1, "month"));
      }
      return false;
    });

    // Group by route
    const groupedData = filteredData.reduce((acc: Record<string, number[]>, booking) => {
      const route = `${booking.pickup_address} → ${booking.drop_address}`;
      if (!acc[route]) acc[route] = [];
      acc[route].push(booking.taxi_amout);
      return acc;
    }, {});

    // Calculate averages for each route
    const averages = Object.entries(groupedData).map(([route, amounts]) => ({
      route,
      average: (amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length).toFixed(2),
    }));

    return averages;
  };

  // Calculate rides, highest, lowest, and average prices for the graph
  const calculateGraphData = (type: string) => {
    const groupedByDay = bookingData.BOOKDATA.reduce((acc: Record<string, number[]>, booking) => {
      const date = dayjs(booking.pickup_date).format("YYYY-MM-DD");
      if (!acc[date]) acc[date] = [];
      acc[date].push(booking.taxi_amout);
      return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(groupedByDay).sort();

    const graphData = sortedDates.map((date) => {
      const amounts = groupedByDay[date];
      switch (type) {
        case "highest":
          return Math.max(...amounts);
        case "lowest":
          return Math.min(...amounts);
        case "average":
          return amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
        case "rides":
        default:
          return amounts.length; // Number of rides
      }
    });

    return {
      labels: sortedDates,
      datasets: [
        {
          label:
            type === "rides"
              ? "Number of Rides"
              : type === "highest"
              ? "Highest Taxi Price"
              : type === "lowest"
              ? "Lowest Taxi Price"
              : "Average Taxi Price",
          data: graphData,
          backgroundColor:
            type === "rides"
              ? "rgba(75, 192, 192, 0.6)"
              : type === "highest"
              ? "rgba(255, 99, 132, 0.6)"
              : type === "lowest"
              ? "rgba(54, 162, 235, 0.6)"
              : "rgba(255, 206, 86, 0.6)",
          borderColor:
            type === "rides"
              ? "rgba(75, 192, 192, 1)"
              : type === "highest"
              ? "rgba(255, 99, 132, 1)"
              : type === "lowest"
              ? "rgba(54, 162, 235, 1)"
              : "rgba(255, 206, 86, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const averages = calculateAverage(view);
  const ridesData = calculateGraphData(graphType);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Taxi Ride Dashboard</h1>

      {/* Dropdown Menu for Timeframe */}
      <div className="mb-6">
        <label htmlFor="timeframe" className="block text-lg font-medium mb-2">
          Select Timeframe:
        </label>
        <select
          id="timeframe"
          className="border rounded-md px-3 py-2 text-lg"
          value={view}
          onChange={(e) => setView(e.target.value)}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Dropdown Menu for Graph Type */}
      <div className="mb-6">
        <label htmlFor="graphType" className="block text-lg font-medium mb-2">
          Select Graph Type:
        </label>
        <select
          id="graphType"
          className="border rounded-md px-3 py-2 text-lg"
          value={graphType}
          onChange={(e) => setGraphType(e.target.value)}
        >
          <option value="rides">Number of Rides</option>
          <option value="highest">Highest Taxi Price</option>
          <option value="lowest">Lowest Taxi Price</option>
          <option value="average">Average Taxi Price</option>
        </select>
      </div>

      {/* Average Prices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {averages.length > 0 ? (
          averages.map((avg, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <h2 className="font-semibold">{avg.route}</h2>
              <p>Average Income: ₹{avg.average}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No data available for the selected timeframe.</p>
        )}
      </div>

      {/* Graph */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">
          {graphType === "rides"
            ? "Number of Rides Per Day"
            : graphType === "highest"
            ? "Highest Taxi Price Per Day"
            : graphType === "lowest"
            ? "Lowest Taxi Price Per Day"
            : "Average Taxi Price Per Day"}
        </h2>
        <Bar data={ridesData} />
      </div>
    </div>
  );
};

export default Page;
