import React, { useState, useEffect } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { useLocation, useHistory, Link } from "react-router-dom";

export const BuyersGuide = ({ data }) => {
  // const { vin } = useParams();
  const { search, state } = useLocation();
  const history = useHistory();

  console.log(state);

  const queryParams = new URLSearchParams(search);
  const vin = queryParams.get("vin");
  const year = queryParams.get("year");
  const make = queryParams.get("make");
  const model = queryParams.get("model");
  const stock = queryParams.get("stock");

  React.useEffect(() => {
    if (
      vin !== null &&
      year !== null &&
      make !== null &&
      model !== null &&
      stock !== null
    ) {
      setFormData((obj) => ({ ...obj, vin, year, make, model, stock }));
    }
  }, [vin, year, make, model, stock]);

  useEffect(() => {
    const generateAndGoBack = async () => {
      if (state && state.length > 0) {
        await batchPDFs(state);
        history.goBack(); // Navigate back to the previous page
      }
    };

    generateAndGoBack();
  }, [state, history]); // Ensure this runs only when `state` or `history` changes

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

    // Handling specifically for the VIN input
    if (name === "vin") {
      const formattedValue = value.toUpperCase();
      setFormData({
        ...formData,
        [name]: formattedValue,
      });

      // Fetch VIN data if length is 17
      if (formattedValue.length === 17) {
        fetchVINData(formattedValue); // Assuming you have a function for fetching VIN data
      }
    } else {
      // Handling for all other inputs
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
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

  // const handlePaste = (e) => {
  //   const pastedVin = e.clipboardData.getData('text');
  //   setVin(pastedVin);
  //   if (pastedVin.length === 17) {
  //     fetchVINData();
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const baseUrl =
      window.location.origin.toString() + import.meta.env.BASE_URL;

    const pdf = {
      name: "pdf/Buyers Guide Form.pdf",
    };

    const pdfurl = baseUrl + pdf.name;
    console.log(pdfurl);
    // Load your PDF document
    const existingPdfBytes = await fetch(pdfurl).then((res) =>
      res.arrayBuffer()
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed a font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Fill in the form fields
    const form = pdfDoc.getForm();
    form.getTextField("year").setText(formData.year || "");
    form.getTextField("make").setText(formData.make || "");
    form.getTextField("model").setText(formData.model || "");
    form.getTextField("vin").setText(formData.vin || "");
    form.getTextField("stock").setText(formData.stock || "");

    // if (formData.includeDealAndCustomer) {
    //   form.getTextField("customer").setText(formData.customer);
    //   form.getTextField("deal").setText(formData.deal);
    // }

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

  const batchPDFs = async (formDataArray) => {
    // Fetch the PDF template once and store it in memory
    const baseUrl =
      window.location.origin.toString() + import.meta.env.BASE_URL;

    const pdf = {
      name: "pdf/Buyers Guide Form.pdf",
    };

    const pdfurl = baseUrl + pdf.name;
    // Load your PDF document

    const existingPdfBytes = await fetch(pdfurl).then((res) =>
      res.arrayBuffer()
    );

    // Create a new PDF document for merging
    const mergedPdfDoc = await PDFDocument.create();

    for (const formData of formDataArray) {
      // Load the template from the in-memory copy
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

      // Flatten the form fields to make them part of the page content
      form.flatten();

      // Serialize the filled PDF to bytes (a Uint8Array)
      const pdfBytes = await pdfDoc.save();

      // Load the filled PDF as a new document to merge
      const filledPdf = await PDFDocument.load(pdfBytes);

      // Copy all pages from the filled PDF to the merged document
      const copiedPages = await mergedPdfDoc.copyPages(
        filledPdf,
        filledPdf.getPageIndices()
      );
      copiedPages.forEach((page) => mergedPdfDoc.addPage(page));
    }

    // Save the merged document
    const mergedPdfBytes = await mergedPdfDoc.save();

    // Trigger the download
    const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  if (state && state.length > 0)
    return (
      <div>
        <button onClick={() => batchPDFs(state)}>
          Get Batch Buyers Guides
        </button>
        {/* <pre className="text-xs">{JSON.stringify(state, null, 2)}</pre> */}
      </div>
    );

  return (
    <div className="flex flex-col">
    
      <form
        className="flex bg-slate-800 py-10 px-4 rounded mx-auto my-4 flex-col w-96 text-black"
        onSubmit={handleSubmit}
      >
        <Input
          type="text"
          name="vin"
          onBlur={handleVinBlur}
          value={formData.vin}
          onChange={handleChange}
          placeholder="VIN"
          label="VIN"
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
        <button
          className="bg-green-500 my-2 w-full py-1 hover:bg-green-400 transition-all rounded"
          type="submit"
        >
          Get Buyer's Guide
        </button>
      </form>
    </div>
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
        value={value || ""}
        onChange={onChange}
        placeholder={placeHolder}
        spellCheck={false}
        autoComplete="false"
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
