import React, { useState, useEffect } from "react";
import { tripAPI, truckAPI, driverAPI, locationAPI } from "../services/api";
import { toast } from "react-toastify";
import Modal from "../components/Modal";
import LoadingSpinner from "../components/LoadingSpinner";
import TripDetail from "../pages/TripDetail";
import { validateTrip, formatCurrency, formatDate } from "../utils/validation";
import { exportToExcel, exportToCSV, exportToPDF } from "../utils/export";
import { useNavigate } from "react-router-dom";

const TripManagement = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    from: "PATNA",

    partiesCount: 1,
    parties: [{ partyNo: 1, material: "", destination: "" }],
    dailyExpense: "",
    truckPayment: "",
    advancePayment: "",
    truck: "",
    driver: "",
    paymentBy: "",
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripsRes, trucksRes, driversRes, locationsRes] = await Promise.all(
        [
          tripAPI.getAll(),
          truckAPI.getAll(),
          driverAPI.getAll(),
          locationAPI.getAll(),
        ],
      );
      setTrips(tripsRes.data);
      setTrucks(trucksRes.data);
      setDrivers(driversRes.data);
      setLocations(locationsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (trip) => {
    setSelectedTrip(trip);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedTrip(null);
  };

  const handleOpenModal = (trip = null) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        date: trip.date ? new Date(trip.date).toISOString().split("T")[0] : "",
        from: trip.from || "PATNA",

        partiesCount: trip.parties?.length || 1,
        parties:
          trip.parties?.length > 0
            ? trip.parties.map((p) => ({
                partyNo: p.partyNo,
                material: p.material,
                destination: p.destination || "",
              }))
            : [{ partyNo: 1, material: "", destination: "" }],
        dailyExpense: trip.dailyExpense,
        truckPayment: trip.truckPayment,
        advancePayment: trip.advancePayment,
        truck: trip.truck?._id || "",
        driver: trip.driver?._id || "",
        paymentBy: trip.paymentBy || "",
      });
    } else {
      setEditingTrip(null);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        from: "PATNA",

        partiesCount: 1,
        parties: [{ partyNo: 1, material: "", destination: "" }],
        dailyExpense: "",
        truckPayment: "",
        advancePayment: "",
        truck: "",
        driver: "",
        paymentBy: "",
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrip(null);
    setFormData({
      date: "",
      from: "",

      partiesCount: 1,
      parties: [{ partyNo: 1, material: "", destination: "" }],
      dailyExpense: "",
      truckPayment: "",
      advancePayment: "",
      truck: "",
      driver: "",
      paymentBy: "",
    });
    setErrors({});
  };

  const totalMaterial = formData.parties.reduce(
    (sum, p) => sum + Number(p.material || 0),
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateTrip({
      ...formData,
      tonMaterial: totalMaterial,
    });

    const isAnyDestMissing = formData.parties.some((p) => !p.destination);
    if (isAnyDestMissing) {
      toast.error("Please select unloading location for all parties");
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        tonMaterial: totalMaterial,
        to: formData.parties[formData.parties.length - 1].destination,
        parties: formData.parties.map((p) => ({
          partyNo: p.partyNo,
          material: Number(p.material),
          destination: p.destination, // Ye dropdown se aayi value hai
        })),
        dailyExpense: parseFloat(formData.dailyExpense),
        truckPayment: parseFloat(formData.truckPayment),
        advancePayment: parseFloat(formData.advancePayment),
        paymentBy: formData.paymentBy,
      };

      if (editingTrip) {
        await tripAPI.update(editingTrip._id, dataToSend);
        toast.success("Trip updated successfully");
      } else {
        await tripAPI.create(dataToSend);
        toast.success("Trip added successfully");
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Error saving trip:", error);
      toast.error(error.response?.data?.message || "Failed to save trip");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await tripAPI.delete(id);
        toast.success("Trip deleted successfully");
        fetchData();
      } catch (error) {
        console.error("Error deleting trip:", error);
        toast.error(error.response?.data?.message || "Failed to delete trip");
      }
    }
  };

  const handleExport = (format) => {
    const dataToExport = filteredTrips;
    if (dataToExport.length === 0) {
      toast.warning("No data to export");
      return;
    }

    let success = false;
    const filename = `trips_${new Date().toISOString().split("T")[0]}`;

    switch (format) {
      case "excel":
        success = exportToExcel(dataToExport, filename);
        break;
      case "csv":
        success = exportToCSV(dataToExport, filename);
        break;
      case "pdf":
        success = exportToPDF(dataToExport, filename);
        break;
      default:
        break;
    }

    if (success) {
      toast.success(`Exported to ${format.toUpperCase()} successfully`);
    } else {
      toast.error("Export failed");
    }

    setShowExportMenu(false);
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.truck?.truckNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      trip.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter
      ? new Date(trip.date).toISOString().split("T")[0] === dateFilter
      : true;

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Trip Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Track and manage all trips
        </p>
      </div>

      {/* Action Buttons - Mobile Optimized */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center justify-center gap-2 py-3 sm:py-2 text-base sm:text-sm"
        >
          <span className="text-xl sm:text-base">➕</span>
          Add Trip
        </button>
      </div>

      {/* Filters and Export - Mobile Responsive */}
      <div className="mb-6 space-y-3 sm:space-y-4">
        {/* Search and Date Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by route, truck, or driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-50">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>

        {/* Export Buttons - Mobile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="btn-success flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 sm:py-2"
          >
            📊 Export Data
            <span
              className={`transform transition-transform ${showExportMenu ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>

          {showExportMenu && (
            <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-48 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button
                onClick={() => handleExport("excel")}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              >
                📊 Export to Excel
              </button>
              <button
                onClick={() => handleExport("csv")}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              >
                📄 Export to CSV
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2"
              >
                📑 Export to PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trips List - Responsive Cards and Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredTrips.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden divide-y divide-gray-200">
              {filteredTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewDetail(trip)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">
                        {formatDate(trip.date)}
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">
                        {trip.from} → {trip.to}
                      </div>
                      <div className="text-sm text-gray-600">
                        {trip.truck?.truckNumber || "N/A"} •{" "}
                        {trip.driver?.name || "N/A"}
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(trip.profit)}
                      </div>
                      <div className="text-xs text-gray-500">Profit</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Material:</span>
                      <span className="font-medium ml-1">
                        {trip.tonMaterial} T
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Advance:</span>
                      <span className="font-medium ml-1">
                        {formatCurrency(trip.advancePayment)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment:</span>
                      <span className="font-medium ml-1">
                        {formatCurrency(trip.truckPayment)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium ml-1">
                        {formatCurrency(trip.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Daily Expense:</span>
                    <span className="font-medium ml-1">
                      {formatCurrency(trip.dailyExpense)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="text-sm">
                      <span className="text-gray-600">Paid by:</span>
                      <span className="font-medium ml-1">
                        {trip.paymentBy || "N/A"}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(trip);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(trip._id);
                        }}
                        className="text-red-600 hover:text-red-900 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Truck
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Material (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Advance Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Truck Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Daily Expense
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTrips.map((trip) => (
                    <tr
                      key={trip._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/trips/${trip._id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(trip.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900">
                          {trip.from}
                        </div>
                        <div className="text-gray-500">→ {trip.to}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.truck?.truckNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.driver?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.tonMaterial}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(trip.advancePayment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(trip.truckPayment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(trip.dailyExpense)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(trip.totalAmount)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                          trip.profit < 0
                            ? "text-red-600"
                            : trip.profit > 0
                              ? "text-green-600"
                              : "text-gray-600"
                        }`}
                      >
                        {formatCurrency(trip.profit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.paymentBy || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(trip);
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(trip._id);
                            }}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 text-base sm:text-lg">
              {searchTerm || dateFilter
                ? "No trips found matching your filters"
                : "No trips added yet"}
            </p>
          </div>
        )}
      </div>

      {/* Trip Detail Modal */}
      <TripDetail
        trip={selectedTrip}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />

      {/* Add/Edit Modal - Mobile Optimized */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTrip ? "Edit Trip" : "Add New Trip"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Date & Material - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className={`input-field w-full ${errors.date ? "border-red-500" : ""}`}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. of Parties
              </label>
              <select
                value={formData.partiesCount}
                onChange={(e) => {
                  const count = Number(e.target.value);
                  const updatedParties = [];
                  for (let i = 0; i < count; i++) {
                    updatedParties.push({
                      partyNo: i + 1,
                      material: formData.parties[i]?.material || "",
                    });
                  }
                  setFormData({
                    ...formData,
                    partiesCount: count,
                    parties: updatedParties,
                  });
                }}
                className="input-field w-full"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Party Materials & Destinations */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 border-b pb-2">
              Unloading Details
            </h3>
            {formData.parties.map((party, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    PARTY {index + 1}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Material Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Material (KG)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={party.material}
                      onChange={(e) => {
                        const updatedParties = [...formData.parties];
                        updatedParties[index].material = e.target.value;
                        setFormData({ ...formData, parties: updatedParties });
                      }}
                      className="input-field w-full"
                      placeholder="Weight"
                    />
                  </div>

                  {/* Dropdown for Destination */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Unloading Location
                    </label>
                    <select
                      required
                      value={party.destination || ""}
                      onChange={(e) => {
                        const updatedParties = [...formData.parties];
                        updatedParties[index].destination = e.target.value;
                        setFormData({ ...formData, parties: updatedParties });
                      }}
                      className="input-field w-full"
                    >
                      <option value="">Select Drop Point</option>
                      {locations.map((loc) => (
                        <option key={loc._id} value={loc.toCity}>
                          {loc.toCity}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Total material */}
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <p className="text-sm sm:text-base font-semibold text-blue-900">
              Total Material: {totalMaterial} KG
            </p>
          </div>

          {/* From & To - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From *
              </label>
              <input
                type="text"
                required
                value={formData.from}
                onChange={(e) =>
                  setFormData({ ...formData, from: e.target.value })
                }
                className={`input-field w-full ${errors.from ? "border-red-500" : ""}`}
                placeholder="Starting location"
              />
              {errors.from && (
                <p className="text-red-500 text-xs mt-1">{errors.from}</p>
              )}
            </div>
          </div>

          {/* Daily Expense & Truck Payment - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advance Payment (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.advancePayment}
                onChange={(e) =>
                  setFormData({ ...formData, advancePayment: e.target.value })
                }
                className={`input-field w-full ${errors.advancePayment ? "border-red-500" : ""}`}
                placeholder="e.g., 5000"
              />
              {errors.advancePayment && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.advancePayment}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Truck Payment (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.truckPayment}
                onChange={(e) =>
                  setFormData({ ...formData, truckPayment: e.target.value })
                }
                className={`input-field w-full ${errors.truckPayment ? "border-red-500" : ""}`}
                placeholder="e.g., 15000"
              />
              {errors.truckPayment && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.truckPayment}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Expense (₹) *
            </label>
            <input
              type="number"
              required
              value={formData.dailyExpense}
              onChange={(e) =>
                setFormData({ ...formData, dailyExpense: e.target.value })
              }
              className={`input-field w-full ${errors.dailyExpense ? "border-red-500" : ""}`}
              placeholder="e.g., 5000"
            />
            {errors.dailyExpense && (
              <p className="text-red-500 text-xs mt-1">{errors.dailyExpense}</p>
            )}
          </div>

          {/* Truck & Driver - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Truck *
              </label>
              <select
                required
                value={formData.truck}
                onChange={(e) =>
                  setFormData({ ...formData, truck: e.target.value })
                }
                className={`input-field w-full ${errors.truck ? "border-red-500" : ""}`}
              >
                <option value="">Select Truck</option>
                {trucks.map((truck) => (
                  <option key={truck._id} value={truck._id}>
                    {truck.truckNumber}
                  </option>
                ))}
              </select>
              {errors.truck && (
                <p className="text-red-500 text-xs mt-1">{errors.truck}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver *
              </label>
              <select
                required
                value={formData.driver}
                onChange={(e) =>
                  setFormData({ ...formData, driver: e.target.value })
                }
                className={`input-field w-full ${errors.driver ? "border-red-500" : ""}`}
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name}
                  </option>
                ))}
              </select>
              {errors.driver && (
                <p className="text-red-500 text-xs mt-1">{errors.driver}</p>
              )}
            </div>
          </div>

          {/* Payment By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment By *
            </label>
            <select
              required
              value={formData.paymentBy}
              onChange={(e) =>
                setFormData({ ...formData, paymentBy: e.target.value })
              }
              className={`input-field w-full ${errors.paymentBy ? "border-red-500" : ""}`}
            >
              <option value="">Select partner</option>
              <option value="Rohit">Rohit</option>
              <option value="Raj Gautam">Raj Gautam</option>
            </select>
            {errors.paymentBy && (
              <p className="text-red-500 text-xs mt-1">{errors.paymentBy}</p>
            )}
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn-secondary w-full sm:w-auto px-6 py-3 sm:py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto px-6 py-3 sm:py-2"
            >
              {editingTrip ? "Update Trip" : "Add Trip"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TripManagement;
