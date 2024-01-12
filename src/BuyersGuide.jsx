import React, { useState } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const BuyersGuide = () => {
  const [formData, setFormData] = useState({
    year: "",
    make: "",
    model: "",
    vin: "",
    stock: "",
    customer: "",
    deal: "",
    includeDealAndCustomer: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value.toUpperCase(),
    });
  };

  const handleVinBlur = () => {
    if (formData.vin.length >= 8) {
      const stockNumber = formData.vin.slice(-8);
      setFormData({ ...formData, stock: stockNumber });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Load your PDF document
    const existingPdfBytes = await fetch("/pdf/Buyers Guide Form.pdf").then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed a font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Fill in the form fields
    const form = pdfDoc.getForm();
    form.getTextField("year").setText(formData.year);
    form.getTextField("make").setText(formData.make);
    form.getTextField("model").setText(formData.model);
    form.getTextField("vin").setText(formData.vin);
    form.getTextField("stock").setText(formData.stock);

    if (formData.includeDealAndCustomer) {
      form.getTextField("customer").setText(formData.customer);
      form.getTextField("deal").setText(formData.deal);
    }

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Trigger download of the filled-out PDF
    // const blob = new Blob([pdfBytes], { type: "application/pdf" });
    // const link = document.createElement("a");
    // link.href = URL.createObjectURL(blob);
    // link.download = "Filled Buyers Guide Form.pdf";
    // link.click();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <form className="flex flex-col w-96 text-black" onSubmit={handleSubmit}>
      <input type="text" name="year" value={formData.year} onChange={handleChange} placeholder="Year" />
      <input type="text" name="make" value={formData.make} onChange={handleChange} placeholder="Make" />
      <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="Model" />
      <input
        type="text"
        name="vin"
        onBlur={handleVinBlur}
        value={formData.vin}
        onChange={handleChange}
        placeholder="VIN"
      />
      <input type="text" name="stock" value={formData.stock} onChange={handleChange} placeholder="Stock" />
      <input type="text" name="customer" value={formData.customer} onChange={handleChange} placeholder="Customer" />
      <input type="text" name="deal" value={formData.deal} onChange={handleChange} placeholder="Deal" />
      <label className="bg-slate-400">
        Include Deal and Customer
        <input
          type="checkbox"
          name="includeDealAndCustomer"
          checked={formData.includeDealAndCustomer}
          onChange={handleChange}
        />
      </label>
      <button className="bg-green-500" type="submit">
        Submit
      </button>
    </form>
  );
};
