import React, { useState, useEffect } from "react";
import { truckAPI } from "../services/api";
import { toast } from "react-toastify";
import Modal from "../components/Modal";
import LoadingSpinner from "../components/LoadingSpinner";
import { validateTruck } from "../utils/validation";

const TruckManagement = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [formData, setFormData] = useState({ truckNumber: "" });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const response = await truckAPI.getAll();
      setTrucks(response.data);
    } catch (error) {
      console.error("Error fetching trucks:", error);
      toast.error("Failed to load trucks");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (truck = null) => {
    if (truck) {
      setEditingTruck(truck);
      setFormData({ truckNumber: truck.truckNumber });
    } else {
      setEditingTruck(null);
      setFormData({ truckNumber: "" });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTruck(null);
    setFormData({ truckNumber: "" });
    setErrors({});
  };

  // Format truck number as MH-12-AB-1234 while typing
  const formatTruckNumber = (value) => {
    let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleaned.length > 2)
      cleaned = cleaned.slice(0, 2) + "-" + cleaned.slice(2);
    if (cleaned.length > 5)
      cleaned = cleaned.slice(0, 5) + "-" + cleaned.slice(5);
    if (cleaned.length > 8)
      cleaned = cleaned.slice(0, 8) + "-" + cleaned.slice(8, 12);
    return cleaned;
  };

  const handleTruckInputChange = (e) => {
    const formatted = formatTruckNumber(e.target.value);
    setFormData({ truckNumber: formatted });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateTruck(formData.truckNumber);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editingTruck) {
        await truckAPI.update(editingTruck._id, formData);
        toast.success("Truck updated successfully");
      } else {
        await truckAPI.create(formData);
        toast.success("Truck added successfully");
      }
      handleCloseModal();
      fetchTrucks();
    } catch (error) {
      console.error("Error saving truck:", error);
      toast.error(error.response?.data?.message || "Failed to save truck");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this truck?")) {
      try {
        await truckAPI.delete(id);
        toast.success("Truck deleted successfully");
        fetchTrucks();
      } catch (error) {
        console.error("Error deleting truck:", error);
        toast.error(error.response?.data?.message || "Failed to delete truck");
      }
    }
  };

  const filteredTrucks = trucks.filter((truck) =>
    truck.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Truck Management</h1>
          <p className="text-gray-600 mt-1">Manage your fleet of trucks</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 4v16m8-8H4"></path>
          </svg>
          Add Truck
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by truck number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
          <svg
            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {/* Truck List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredTrucks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Truck Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrucks.map((truck, index) => (
                  <tr key={truck._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      🚛 {truck.truckNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(truck)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(truck._id)}
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
        ) : (
          <div className="text-center py-12 text-gray-500">
            {searchTerm
              ? "No trucks found matching your search"
              : "No trucks added yet"}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTruck ? "Edit Truck" : "Add New Truck"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Truck Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.truckNumber}
              onChange={handleTruckInputChange}
              className={`input-field ${errors.truckNumber ? "border-red-500" : ""}`}
              placeholder="MH-12-AB-1234"
              maxLength={13}
            />
            {errors.truckNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.truckNumber}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingTruck ? "Update" : "Add"} Truck
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TruckManagement;
