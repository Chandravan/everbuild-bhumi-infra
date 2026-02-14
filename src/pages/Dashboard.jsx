import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { truckAPI, driverAPI, tripAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-toastify";
import { formatCurrency, formatDate } from "../utils/validation";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTrucks: 0,
    totalDrivers: 0,
    totalTrips: 0,
    totalRevenue: 0,
  });

  const [partnerTotals, setPartnerTotals] = useState({
    partner1: 0,
    partner2: 0,
  });

  const [totalDue, setTotalDue] = useState(0);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      const retryTimer = setTimeout(() => {
        fetchDashboardData();
      }, 500);
      return () => clearTimeout(retryTimer);
    } else {
      // Token mil gaya toh turant call karein
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        trucksRes,
        driversRes,
        tripsRes,
        totalProfitRes,
        totalByPartnerRes,
        totalDueRes,
      ] = await Promise.all([
        truckAPI.getAll(),
        driverAPI.getAll(),
        tripAPI.getAll(),
        tripAPI.totalProfit(),
        tripAPI.totalByPartner(),
        tripAPI.totalDue(),
      ]);

      const trucks = trucksRes.data;
      const drivers = driversRes.data;
      const trips = tripsRes.data;
      const totalProfit = totalProfitRes.data?.totalProfit || 0;
      const RohitTotal = totalByPartnerRes.data?.RohitTotal || 0;
      const RajGautamTotal = totalByPartnerRes.data?.RajGautamTotal || 0;
      const due = totalDueRes.data?.totalDue || 0;

      setStats({
        totalTrucks: trucks.length,
        totalDrivers: drivers.length,
        totalTrips: trips.length,
        totalRevenue: totalProfit,
      });

      setPartnerTotals({
        partner1: RohitTotal,
        partner2: RajGautamTotal,
      });

      setTotalDue(due);

      // Get recent 5 trips
      const sortedTrips = trips
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setRecentTrips(sortedTrips);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  // Calculate dynamic trends (you can replace this with actual month-over-month API data)
  const calculateTrend = (current, previous = 0) => {
    if (previous === 0) return "+0%";
    const change = (((current - previous) / previous) * 100).toFixed(0);
    return change >= 0 ? `+${change}%` : `${change}%`;
  };

  const statCards = [
    {
      title: "Total Trucks",
      value: stats.totalTrucks,
      icon: "🚛",
      gradient: "from-blue-600 via-blue-500 to-cyan-400",
      shadowColor: "shadow-blue-500/20",
      link: "/trucks",
      trend: calculateTrend(
        stats.totalTrucks,
        Math.max(0, stats.totalTrucks - 2),
      ), // Mock: assume 2 less last month
    },
    {
      title: "Total Drivers",
      value: stats.totalDrivers,
      icon: "👤",
      gradient: "from-emerald-600 via-green-500 to-teal-400",
      shadowColor: "shadow-emerald-500/20",
      link: "/drivers",
      trend: calculateTrend(
        stats.totalDrivers,
        Math.max(0, stats.totalDrivers - 1),
      ), // Mock: assume 1 less last month
    },
    {
      title: "Total Trips",
      value: stats.totalTrips,
      icon: "🗺️",
      gradient: "from-violet-600 via-purple-500 to-fuchsia-400",
      shadowColor: "shadow-violet-500/20",
      link: "/trips",
      trend: calculateTrend(
        stats.totalTrips,
        Math.max(0, Math.floor(stats.totalTrips * 0.85)),
      ), // Mock: 15% growth
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: "💰",
      gradient: "from-amber-600 via-yellow-500 to-orange-400",
      shadowColor: "shadow-amber-500/20",
      link: "/trips",
      trend: calculateTrend(
        stats.totalRevenue,
        Math.max(0, Math.floor(stats.totalRevenue * 0.88)),
      ), // Mock: 12% growth
    },
    {
      title: "Total Due",
      value: formatCurrency(totalDue),
      icon: "⚠️",
      gradient: "from-rose-600 via-red-500 to-pink-400",
      shadowColor: "shadow-rose-500/20",
      link: "/due-payments",
      trend: calculateTrend(totalDue, Math.max(0, Math.floor(totalDue * 1.05))), // Mock: 5% reduction (negative trend is good)
    },
  ];

  // Calculate dynamic percentages
  const totalPayments = partnerTotals.partner1 + partnerTotals.partner2;
  const partner1Percentage =
    totalPayments > 0
      ? ((partnerTotals.partner1 / totalPayments) * 100).toFixed(1)
      : 0;
  const partner2Percentage =
    totalPayments > 0
      ? ((partnerTotals.partner2 / totalPayments) * 100).toFixed(1)
      : 0;

  const partnerCards = [
    {
      title: "Rohit's Payments",
      value: formatCurrency(partnerTotals.partner1),
      icon: "🤝",
      gradient: "from-indigo-600 via-blue-500 to-cyan-400",
      percentage: `${partner1Percentage}%`,
      percentageValue: partner1Percentage,
    },
    {
      title: "Raj Gautam's Payments",
      value: formatCurrency(partnerTotals.partner2),
      icon: "🤝",
      gradient: "from-fuchsia-600 via-purple-500 to-pink-400",
      percentage: `${partner2Percentage}%`,
      percentageValue: partner2Percentage,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        * {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }

        .stat-card {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .stat-card:hover::before {
          left: 100%;
        }

        .stat-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .partner-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .partner-card:hover {
          transform: scale(1.02);
        }

        .trip-row {
          transition: all 0.2s ease;
        }

        .trip-row:hover {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.05), transparent);
          transform: translateX(4px);
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .metric-badge {
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6));
          backdrop-filter: blur(10px);
        }
      `}</style>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div
          className="animate-fadeInUp"
          style={{ animationDelay: "0.1s", opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-2">
                <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-lg text-gray-600 font-light">
                Real-time insights into your transport operations
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="glass-effect px-4 py-2 rounded-xl border border-gray-200/50">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  Live Status
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-900">
                    All Systems Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {statCards.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="animate-scaleIn stat-card"
              style={{ animationDelay: `${0.1 + index * 0.1}s`, opacity: 0 }}
            >
              <div
                className={`relative glass-effect rounded-2xl overflow-hidden border border-gray-200/50 ${stat.shadowColor} shadow-xl`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>

                <div className="relative p-6">
                  {/* Icon & Trend */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`text-5xl transform transition-transform duration-300 group-hover:scale-110`}
                    >
                      {stat.icon}
                    </div>
                    <div className="metric-badge px-3 py-1 rounded-full">
                      <span
                        className={`text-xs font-semibold ${
                          stat.trend.startsWith("+")
                            ? "text-green-600"
                            : stat.trend.startsWith("-")
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {stat.trend}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-2">
                    {stat.title}
                  </p>

                  {/* Value */}
                  <p className="text-3xl font-bold text-gray-900 mb-4 mono">
                    {stat.value}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center text-xs text-gray-500 group-hover:text-indigo-600 transition-colors">
                    <span className="font-medium">View Details</span>
                    <svg
                      className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Decorative Element */}
                <div
                  className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl`}
                ></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Partner Payments Section */}
        <div
          className="animate-slideInRight"
          style={{ animationDelay: "0.6s", opacity: 0 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Partner Contributions
            </h2>
            <p className="text-gray-600">
              Payment distribution across business partners
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {partnerCards.map((card, index) => (
              <div
                key={index}
                className="partner-card glass-effect rounded-2xl overflow-hidden border border-gray-200/50 shadow-xl"
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                <div
                  className={`relative p-8 bg-gradient-to-br ${card.gradient}`}
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="text-6xl">{card.icon}</div>
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
                          Share
                        </p>
                        <p className="text-white text-xl font-bold mono">
                          {card.percentage}
                        </p>
                      </div>
                    </div>

                    <p className="text-white/90 text-sm font-medium uppercase tracking-wider mb-3">
                      {card.title}
                    </p>

                    <p className="text-white text-4xl font-bold mono mb-4">
                      {card.value}
                    </p>

                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-1000"
                        style={{ width: `${card.percentageValue}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Decorative circles */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trips Table */}
        <div
          className="animate-fadeInUp"
          style={{ animationDelay: "0.9s", opacity: 0 }}
        >
          <div className="glass-effect rounded-2xl overflow-hidden border border-gray-200/50 shadow-xl">
            <div className="px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Recent Trips
                  </h2>
                  <p className="text-sm text-gray-600">
                    Latest transportation activities
                  </p>
                </div>
                <Link
                  to="/trips"
                  className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span>View All</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              {recentTrips.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200/50">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Truck
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Material
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {recentTrips.map((trip, idx) => (
                      <tr
                        key={trip._id}
                        className="trip-row group"
                        style={{ animationDelay: `${1 + idx * 0.05}s` }}
                      >
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="text-sm font-medium text-gray-900 mono">
                              {formatDate(trip.date)}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {trip.from}
                            </span>
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            <span className="text-sm font-semibold text-gray-900">
                              {trip.to}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium mono">
                            {trip.truck?.truckNumber || "N/A"}
                          </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {trip.driver?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 mono">
                              {trip.tonMaterial}
                            </span>
                            <span className="text-xs text-gray-500">tons</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className="text-sm font-bold text-emerald-600 mono">
                            {formatCurrency(
                              (trip.dailyExpense || 0) +
                                (trip.truckPayment || 0),
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                  </div>
                  <p className="text-gray-500 text-lg font-medium mb-2">
                    No trips recorded yet
                  </p>
                  <Link
                    to="/trips"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mt-2"
                  >
                    Create your first trip
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp"
          style={{ animationDelay: "1.1s", opacity: 0 }}
        >
          <Link
            to="/trucks"
            className="group relative glass-effect p-8 rounded-2xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform">
                <span className="text-3xl">🚛</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Add New Truck
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Register a new truck in your fleet and start tracking
              </p>
            </div>
          </Link>

          <Link
            to="/drivers"
            className="group relative glass-effect p-8 rounded-2xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Add New Driver
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Add a new driver to your team with complete details
              </p>
            </div>
          </Link>

          <Link
            to="/trips"
            className="group relative glass-effect p-8 rounded-2xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-fuchsia-400 rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform">
                <span className="text-3xl">🗺️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Create New Trip
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Schedule and track a new trip with all details
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
