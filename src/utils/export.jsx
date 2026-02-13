import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatCurrency, formatDate } from "./validation";

// ✅ Excel Export
export const exportToExcel = (data, filename = "trips_export") => {
  try {
    const exportData = data.map((trip, index) => ({
      "S.No": index + 1,
      Date: formatDate(trip.date),
      From: trip.from,
      To: trip.to,
      Truck: trip.truck?.truckNumber || "N/A",
      Driver: trip.driver?.name || "N/A",
      "Material (Tons)": trip.tonMaterial,
      "Daily Expense": trip.dailyExpense,
      "Truck Payment": trip.truckPayment,
      Total: trip.dailyExpense + trip.truckPayment,
      "Payment By": trip.paymentBy || "N/A", // ✅ new column
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trips");
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error("Excel export error:", error);
    return false;
  }
};

// ✅ CSV Export
export const exportToCSV = (data, filename = "trips_export") => {
  try {
    const exportData = data.map((trip, index) => ({
      "S.No": index + 1,
      Date: formatDate(trip.date),
      From: trip.from,
      To: trip.to,
      Truck: trip.truck?.truckNumber || "N/A",
      Driver: trip.driver?.name || "N/A",
      "Material (Tons)": trip.tonMaterial,
      "Daily Expense": trip.dailyExpense,
      "Truck Payment": trip.truckPayment,
      Total: trip.dailyExpense + trip.truckPayment,
      "Payment By": trip.paymentBy || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error("CSV export error:", error);
    return false;
  }
};

// ✅ PDF Export
export const exportToPDF = (data, filename = "trips_export") => {
  try {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Trip Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 14, 28);

    const tableData = data.map((trip, index) => [
      index + 1,
      formatDate(trip.date),
      trip.from,
      trip.to,
      trip.truck?.truckNumber || "N/A",
      trip.driver?.name || "N/A",
      trip.tonMaterial,
      formatCurrency(trip.dailyExpense),
      formatCurrency(trip.truckPayment),
      formatCurrency(trip.dailyExpense + trip.truckPayment),
      trip.paymentBy || "N/A", // ✅ new column
    ]);

    doc.autoTable({
      head: [
        [
          "#",
          "Date",
          "From",
          "To",
          "Truck",
          "Driver",
          "Material\n(Tons)",
          "Daily\nExpense",
          "Truck\nPayment",
          "Total",
          "Payment By",
        ],
      ],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 15 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20 },
        9: { cellWidth: 20 },
        10: { cellWidth: 25 }, // Payment By
      },
    });

    doc.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error("PDF export error:", error);
    return false;
  }
};
