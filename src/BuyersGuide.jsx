import React, { useState } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { useParams } from "react-router-dom";

export const BuyersGuide = () => {
  const { vin } = useParams();

  const [formData, setFormData] = useState({
    year: "",
    make: "",
    model: "",
    vin: vin,
    stock: "",
    customer: "",
    deal: "",
    includeDealAndCustomer: false,
  });

  const [lastFetchedVin, setLastFetchedVin] = React.useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value.toUpperCase(),
    });
  };

  const handleVinBlur = async () => {
    const vin = formData.vin;

    if (vin.length === 17 && lastFetchedVin !== vin) {
      try {
        const vinData = await fetchVINData(vin);
        setLastFetchedVin(vin);

        // Check if year, make, or model fields already have data
        if (formData.year || formData.make || formData.model) {
          if (
            window.confirm(
              "Data already exists for Year, Make, Model. Do you want to overwrite?"
            )
          ) {
            setFormData({
              ...formData,
              year: vinData.year,
              make: vinData.make,
              model: vinData.model,
              stock: vin.slice(-8),
            });
          }
        } else {
          setFormData({
            ...formData,
            year: vinData.year,
            make: vinData.make,
            model: vinData.model,
            stock: vin.slice(-8),
          });
        }
      } catch (error) {
        console.error("Error fetching data for VIN:", vin, error);
        // Handle the error appropriately (e.g., show a message to the user)
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Load your PDF document
    const existingPdfBytes = await fetch("pdf/Buyers Guide Form.pdf").then(
      (res) => res.arrayBuffer()
    );
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
      <Input
        type="text"
        name="vin"
        onBlur={handleVinBlur}
        value={formData.vin}
        onChange={handleChange}
        placeholder="VIN"
        label="VIN"
        autoFocus={true}
      />
      <Input
        type="text"
        name="year"
        value={formData.year}
        onChange={handleChange}
        placeholder="Year"
        label="Year"
      />
      <Input
        type="text"
        name="make"
        value={formData.make}
        onChange={handleChange}
        placeholder="Make"
        label="Make"
      />
      <Input
        type="text"
        name="model"
        value={formData.model}
        onChange={handleChange}
        placeholder="Model"
        label="Model"
      />

      <Input
        type="text"
        name="stock"
        value={formData.stock}
        onChange={handleChange}
        placeholder="Stock"
        label="Stock"
      />
      {/* <input
        type="text"
        name="customer"
        value={formData.customer}
        onChange={handleChange}
        placeholder="Customer"
      />
      <input
        type="text"
        name="deal"
        value={formData.deal}
        onChange={handleChange}
        placeholder="Deal"
      />
      <label className="bg-slate-400">
        Include Deal and Customer
        <input
          type="checkbox"
          name="includeDealAndCustomer"
          checked={formData.includeDealAndCustomer}
          onChange={handleChange}
        />
      </label> */}
      <button className="bg-green-500 w-64 rounded" type="submit">
        Submit
      </button>
    </form>
  );
};

const Input = ({
  name,
  label,
  value,
  onBlur,
  onChange,
  placeHolder,
  autoFocus = false,
}) => {
  return (
    <label htmlFor={name} className="flex flex-col">
      <span className="text-xs text-white leading-none">{label}</span>
      <input
        type="text"
        className="px-2 py-1 rounded my-1"
        name={name}
        onBlur={onBlur}
        value={value}
        onChange={onChange}
        placeholder={placeHolder}
        spellCheck={false}
        autoComplete={false}
        autoFocus={autoFocus}
      />
    </label>
  );
};

const fetchVINData = async (vin) => {
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
    );
    const data = await response.json();

    const results = data.Results;
    const decodedData = {
      vin,
      year: results.find((r) => r.Variable === "Model Year")?.Value,
      make: results.find((r) => r.Variable === "Make")?.Value,
      model: results.find((r) => r.Variable === "Model")?.Value,
    };

    return decodedData;
  } catch (error) {
    console.error("Error fetching VIN data:", error);
    // You can throw the error or return a default value depending on how you want to handle errors
    throw error; // or return a default value/object
  }
};
