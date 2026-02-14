import React, { useState, useEffect } from "react";
import { dueAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatCurrency, formatDate } from "../utils/validation";
import { toast } from "react-toastify";

const DuePayments = () => {
  const [dueTrips, setDueTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDueData = async () => {
    try {
      setLoading(true);
      const [response, totalRes] = await Promise.all([
        dueAPI.getDuePayments(),
        dueAPI.totalDue(),
      ]);
      setDueTrips(response.data.dueTrip || []);
      setTotalAmount(totalRes.data.totalDue || 0);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load due payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueData();
  }, []);

  const handleMarkPaid = async (id) => {
    if (!window.confirm("Confirm payment received?")) return;
    try {
      await dueAPI.markAsPaid(id);
      toast.success("Payment marked as received!");
      const tripToRemove = dueTrips.find((t) => t._id === id);
      setDueTrips((prev) => prev.filter((trip) => trip._id !== id));
      setTotalAmount((prev) => prev - (tripToRemove?.due || 0));
    } catch (error) {
      toast.error("Update failed. Try again.");
    }
  };

  const filteredTrips = dueTrips.filter((trip) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      trip.truck?.truckNumber?.toLowerCase().includes(searchLower) ||
      trip.from?.toLowerCase().includes(searchLower) ||
      trip.to?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-['Inter',sans-serif]">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-rose-500 to-rose-600 rounded-full"></div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Due Payments
                </h1>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 uppercase">
                  Live
                </span>
              </div>
              <p className="text-slate-500 text-sm sm:text-base ml-5">
                Manage all outstanding transport balances.
              </p>
            </div>

            {/* Stats Cards - Fixed for Mobile Overflow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-4 sm:p-5 border border-rose-200 shadow-sm min-w-[220px]">
                <p className="text-[10px] font-bold text-rose-700 uppercase mb-1">
                  Outstanding Balance
                </p>
                <p className="text-xl sm:text-2xl font-black text-rose-900 break-words leading-tight">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-5 border border-blue-200 shadow-sm min-w-[220px]">
                <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">
                  Pending Trips
                </p>
                <p className="text-xl sm:text-2xl font-black text-blue-900">
                  {dueTrips.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search & Refresh */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search truck number, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all shadow-sm"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={fetchDueData}
            className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            Refresh
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Truck
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Route
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
                    <tr
                      key={trip._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-5 text-sm font-medium text-slate-600 whitespace-nowrap">
                        {formatDate(trip.date)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-mono">
                          {trip.truck?.truckNumber || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <span>{trip.from}</span>
                          <span className="text-slate-300">→</span>
                          <span>{trip.to}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-rose-600 text-lg whitespace-nowrap">
                        {formatCurrency(trip.due)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => handleMarkPaid(trip._id)}
                          className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                        >
                          Mark Paid
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-20 text-center text-slate-400 italic"
                    >
                      No pending payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuePayments;
