import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tripAPI } from "../services/api";
import { formatCurrency, formatDate } from "../utils/validation";

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const res = await tripAPI.getById(id);
        setTrip(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to fetch trip",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">
        Loading trip details...
      </div>
    );
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!trip)
    return (
      <div className="p-6 text-center text-gray-600">
        No trip data available
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trip Details</h1>
            <p className="text-gray-500 mt-1">Trip ID: {trip._id}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Date: {formatDate(trip.date)}</p>
          </div>
        </div>

        {/* Route Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Route</h2>
          <div className="flex justify-between bg-gray-100 p-4 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm text-gray-500">From</p>
              <p className="font-semibold text-gray-800">{trip.from}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Parties</p>
              <p className="font-semibold text-gray-800">{trip.partiesCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">To</p>
              <p className="font-semibold text-gray-800">{trip.to}</p>
            </div>
          </div>
        </div>

        {/* Parties Details */}
        {trip.parties && trip.parties.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Party-wise Material Distribution
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2 text-left">Party No</th>
                    <th className="border px-4 py-2 text-right">
                      Material (kg)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trip.parties.map((party, index) => (
                    <tr
                      key={party._id}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="border px-4 py-2">
                        Party {party.partyNo}
                      </td>
                      <td className="border px-4 py-2 text-right font-semibold">
                        {party.material.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-100 font-bold">
                    <td className="border px-4 py-2">Total Material</td>
                    <td className="border px-4 py-2 text-right">
                      {trip.tonMaterial.toLocaleString()} kg
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Financial Details
          </h2>
          <table className="w-full table-auto border-collapse border border-gray-200">
            <tbody>
              <tr className="bg-gray-100">
                <td className="border px-4 py-2 font-semibold">Rate per kg</td>
                <td className="border px-4 py-2">₹{trip.rate}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">Total Amount</td>
                <td className="border px-4 py-2 font-bold text-blue-600">
                  {formatCurrency(trip.totalAmount)}
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td className="border px-4 py-2 font-semibold">
                  Truck Payment
                </td>
                <td className="border px-4 py-2">
                  {formatCurrency(trip.truckPayment)}
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">
                  Daily Expense
                </td>
                <td className="border px-4 py-2">
                  {formatCurrency(trip.dailyExpense)}
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td className="border px-4 py-2 font-semibold">
                  Advance Payment
                </td>
                <td className="border px-4 py-2">
                  {formatCurrency(trip.advancePayment)}
                </td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">Due Amount</td>
                <td className="border px-4 py-2 font-bold text-orange-600">
                  {formatCurrency(trip.due)}
                </td>
              </tr>
              <tr className="bg-green-50">
                <td className="border px-4 py-2 font-semibold">Profit</td>
                <td
                  className={`border px-4 py-2 font-bold text-lg ${trip.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(trip.profit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Other Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Other Details
          </h2>
          <table className="w-full table-auto border-collapse border border-gray-200">
            <tbody>
              <tr className="bg-gray-100">
                <td className="border px-4 py-2 font-semibold">Payment By</td>
                <td className="border px-4 py-2">{trip.paymentBy}</td>
              </tr>
              <tr>
                <td className="border px-4 py-2 font-semibold">Truck ID</td>
                <td className="border px-4 py-2 font-mono text-sm">
                  {trip.truck}
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td className="border px-4 py-2 font-semibold">Driver ID</td>
                <td className="border px-4 py-2 font-mono text-sm">
                  {trip.driver}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer / Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div className="text-sm text-gray-500">
            <p>Created: {formatDate(trip.createdAt)}</p>
            <p>Updated: {formatDate(trip.updatedAt)}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
