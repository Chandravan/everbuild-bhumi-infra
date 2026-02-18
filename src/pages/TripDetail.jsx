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

  // Modal and Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [newInvoice, setNewInvoice] = useState("");

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const res = await tripAPI.getById(id);
      setTrip(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch trip");
    } finally {
      setLoading(false);
    }
  };

  // Generic function to sync any party change to backend
  const syncPartyUpdate = async (partyId, updates) => {
    try {
      // Calling the PATCH /trips/:id/party/:partyId endpoint
      const res = await tripAPI.updatePartyDetails(id, partyId, updates);
      setTrip(res.data); // Backend returns the full updated trip object

      // If modal is open for this party, update the local selectedParty state too
      if (selectedParty && selectedParty._id === partyId) {
        const updatedParty = res.data.parties.find((p) => p._id === partyId);
        setSelectedParty(updatedParty);
      }
    } catch (err) {
      alert("Failed to sync with server: " + err.message);
    }
  };

  const toggleReceiving = (e, party) => {
    e.stopPropagation();
    const nextStatus = party.status === "Received" ? "Pending" : "Received";
    syncPartyUpdate(party._id, { status: nextStatus });
  };

  const handleFileUpload = (e, partyId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Saving base64 to DB (For now)
        syncPartyUpdate(partyId, { podUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addInvoice = () => {
    if (!newInvoice.trim()) return;
    const updatedInvoices = [
      ...(selectedParty.invoices || []),
      newInvoice.trim(),
    ];
    syncPartyUpdate(selectedParty._id, { invoices: updatedInvoices });
    setNewInvoice("");
  };

  const removeInvoice = (partyId, index) => {
    const party = trip.parties.find((p) => p._id === partyId);
    const updatedInvoices = party.invoices.filter((_, i) => i !== index);
    syncPartyUpdate(partyId, { invoices: updatedInvoices });
  };

  if (loading)
    return (
      <div className="p-12 text-center font-bold text-slate-400">
        Loading trip...
      </div>
    );
  if (error)
    return (
      <div className="p-12 text-center text-red-500 font-bold">{error}</div>
    );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-bold text-slate-500 hover:text-blue-600 transition"
          >
            ← BACK
          </button>
          <div className="flex gap-2">
            <button className="bg-white border px-4 py-2 rounded-lg text-xs font-bold shadow-sm">
              PRINT
            </button>
            <button className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-md">
              EDIT TRIP
            </button>
          </div>
        </div>

        {/* Header Summary */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Logistic Summary
              </span>
              <h1 className="text-3xl font-black mt-4 text-slate-900">
                {trip.from} → {trip.to}
              </h1>
              <p className="text-slate-400 text-sm">
                Trip ID: {trip._id.toUpperCase()}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border">
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Departure
              </p>
              <p className="text-lg font-black text-slate-700">
                {formatDate(trip.date)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b bg-slate-50/30 flex justify-between items-center">
                <h3 className="font-black text-slate-700 uppercase text-sm">
                  Parties, Invoices & POD
                </h3>
              </div>

              <div className="divide-y divide-slate-50">
                {trip.parties.map((party) => (
                  <div
                    key={party._id}
                    onClick={() => {
                      setSelectedParty(party);
                      setIsModalOpen(true);
                    }}
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/50 transition cursor-pointer group gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${party.status === "Received" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-slate-200"}`}
                      ></div>
                      <div>
                        <p className="font-black text-slate-800">
                          Party {party.partyNo} ({party.destination})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {party.invoices?.map((inv, idx) => (
                            <span
                              key={idx}
                              className="bg-white border text-[9px] px-2 py-0.5 rounded font-bold text-slate-500"
                            >
                              #{inv}
                            </span>
                          )) || (
                            <span className="text-[10px] text-slate-300 uppercase">
                              No Invoices
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end md:self-auto">
                      <p className="text-sm font-black text-slate-700">
                        {party.material.toLocaleString()} kg
                      </p>

                      {/* Toggle */}
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase">
                          Received?
                        </p>
                        <button
                          onClick={(e) => toggleReceiving(e, party)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${party.status === "Received" ? "bg-green-500" : "bg-slate-300"}`}
                        >
                          <span
                            className={`h-3 w-3 transform rounded-full bg-white transition ${party.status === "Received" ? "translate-x-6" : "translate-x-1"}`}
                          />
                        </button>
                      </div>

                      {/* POD Section */}
                      {party.status === "Received" && (
                        <div
                          className="flex flex-col items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-[8px] font-black text-slate-400 uppercase">
                            POD File
                          </p>
                          {party.podUrl ? (
                            <div className="relative group">
                              <img
                                src={party.podUrl}
                                alt="POD"
                                className="w-8 h-8 rounded border-2 border-green-500 object-cover"
                              />
                              <label className="absolute inset-0 bg-black/40 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition">
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileUpload(e, party._id)
                                  }
                                />
                                <span className="text-[8px] text-white font-bold underline">
                                  EDIT
                                </span>
                              </label>
                            </div>
                          ) : (
                            <label className="cursor-pointer bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, party._id)}
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest mb-6 border-b pb-4 text-center">
                Logistics
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase">
                    Truck
                  </p>
                  <p className="font-mono font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-lg mt-1 inline-block uppercase">
                    {trip.truck?.truckNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase">
                    Driver / Managed By
                  </p>
                  <p className="font-bold text-slate-700 mt-1">
                    {trip.driver?.name || trip.paymentBy}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-500 rounded-3xl p-8 text-white shadow-xl shadow-orange-100">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                Pending Due
              </p>
              <p className="text-4xl font-black mt-2 leading-none">
                {formatCurrency(trip.due)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">
                Invoices - Party {selectedParty?.partyNo}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-2xl text-slate-300 hover:text-slate-500"
              >
                &times;
              </button>
            </div>
            <div className="p-8">
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Invoice Number..."
                  className="bg-slate-50 flex-1 px-4 py-3 rounded-xl focus:outline-none font-bold text-sm border"
                  value={newInvoice}
                  onChange={(e) => setNewInvoice(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addInvoice()}
                />
                <button
                  onClick={addInvoice}
                  className="bg-slate-900 text-white px-6 rounded-xl font-black text-xs"
                >
                  ADD
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedParty?.invoices?.map((inv, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-white border p-3 rounded-xl shadow-sm"
                  >
                    <span className="font-bold text-slate-700">#{inv}</span>
                    <button
                      onClick={() => removeInvoice(selectedParty._id, idx)}
                      className="text-red-400 text-[10px] font-black hover:text-red-600 transition"
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 bg-slate-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-white border py-3 rounded-xl font-black text-xs uppercase shadow-sm"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetail;
