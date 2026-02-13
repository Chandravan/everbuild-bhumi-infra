// utils/validation.js

// Truck number validation (strict format)
export const validateTruck = (truckNumber) => {
  const errors = {};

  // Regex for exact format: 2 letters - 2 digits - 2 letters - 4 digits
  const regex = /^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/;

  if (!truckNumber) {
    errors.truckNumber = "Truck number is required";
  } else if (!regex.test(truckNumber)) {
    errors.truckNumber = "Truck number must be in format: MH-12-AB-1234";
  }

  return errors;
};

// Driver validation
export const validateDriver = (formData) => {
  const errors = {};

  if (!formData.name || formData.name.trim() === "") {
    errors.name = "Driver name is required";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!formData.mobile || formData.mobile.trim() === "") {
    errors.mobile = "Mobile number is required";
  } else if (!/^[0-9]{10}$/.test(formData.mobile.replace(/[\s-]/g, ""))) {
    errors.mobile = "Mobile number must be 10 digits";
  }

  return errors;
};

// Trip validation
export const validateTrip = (formData) => {
  const errors = {};

  if (!formData.date) errors.date = "Date is required";
  if (!formData.from || formData.from.trim() === "")
    errors.from = "Starting location is required";
  if (!formData.to || formData.to.trim() === "")
    errors.to = "Destination is required";
  if (
    !formData.tonMaterial ||
    isNaN(formData.tonMaterial) ||
    parseFloat(formData.tonMaterial) <= 0
  )
    errors.tonMaterial = "Valid material weight (in tons) is required";
  if (
    !formData.dailyExpense ||
    isNaN(formData.dailyExpense) ||
    parseFloat(formData.dailyExpense) < 0
  )
    errors.dailyExpense = "Valid daily expense is required";
  if (
    !formData.truckPayment ||
    isNaN(formData.truckPayment) ||
    parseFloat(formData.truckPayment) < 0
  )
    errors.truckPayment = "Valid truck payment is required";
  if (!formData.truck) errors.truck = "Please select a truck";
  if (!formData.driver) errors.driver = "Please select a driver";

  if (!formData.paymentBy || formData.paymentBy.trim() === "")
    errors.paymentBy = "Please select who is paying";

  return errors;
};

// Currency formatter
export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);

// Date formatter
export const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
