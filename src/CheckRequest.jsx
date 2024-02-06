import React from "react";
import { PDFDocument, rgb, TextAlignment } from "pdf-lib";
import download from "downloadjs";

import { MdClear, MdUndo } from "react-icons/md";
import { useLocation, useHistory, Link } from "react-router-dom";

const pasteHandler = (onChange) => {
  return function (event) {
    event.preventDefault();
    let selectionStart = event.target.selectionStart;
    let selectionEnd = event.target.selectionEnd;
    let pasteText = event.clipboardData.getData("text").trim();
    let initialValue = event.target.value;
    event.target.value =
      event.target.value.substring(0, selectionStart) +
      pasteText +
      event.target.value.substring(selectionEnd, initialValue.length);
    onChange(event);
    event.target.selectionStart = selectionStart;
    event.target.selectionEnd = selectionStart + pasteText.length;
  };
};

const revertHandler = (onChange, defaultValue, name) => {
  return function (event) {
    event.preventDefault();
    onChange({ target: { name, value: defaultValue } });
  };
};

export const Input = ({
  name,
  placeholder = "",
  Icon = undefined,
  type = "text",
  inputMode,
  step,
  value,
  defaultValue,
  onChange,
  readOnly = false,
  units = "",
  align = "left",
  label = "",
  min = 0,
  onBlur = () => {},
  helperText = "",
  autoFocus = false,
  Helper = () => {
    return null;
  },
  ActionButton = () => {
    return null;
  },
  meta,
  labelAction = null,
  className = "",
  containerClassName = "",
  onKeyDown = null,
  pattern = null,
  input,
  disableSelectOnFocus = false,
  ...rest
}) => {
  const textAlign = {
    center: "text-center",
    left: "text-left",
    right: "text-right",
  };

  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (autoFocus) inputRef.current.focus();
  }, [autoFocus]);

  return (
    <div
      className={`w-full  ${
        defaultValue && defaultValue !== value ? "bg-green-100 rounded-lg" : ""
      }  focus-within:text-green-600 max-w-lg box-border mb-2 transition-all ${containerClassName}`}
    >
      {!!label && type !== "hidden" && (
        <label htmlFor={name} className="text-xs font-sans   text-justify pl-2 flex justify-between items-center">
          {label}{" "}
          {labelAction && (
            <button type="button" onClick={labelAction}>
              <MdClear />
            </button>
          )}
          {/* {defaultValue && defaultValue !== value && (
            <button
              className="px-2 flex items-center space-x-2 bg-black bg-opacity-5 rounded-md text-[8px]"
              onClick={revertHandler(
                onChange ? onChange : input?.onChange,
                defaultValue,
                name
              )}
            >
              <MdUndo />
              <span>{defaultValue}</span>
            </button>
          )} */}
        </label>
      )}
      <div className="relative w-full flex justify-between items-center  bg-white bg-opacity-70  hover:border-green-300 hover:focus-within:border-green-500  rounded-md  border focus-within:border-green-400 transition-all  ">
        {!!Icon && <Icon className="ml-2 min-w-fit" />}
        <input
          {...rest}
          onKeyDown={onKeyDown}
          ref={inputRef}
          type={type}
          name={name}
          placeholder={placeholder?.toString()}
          autoComplete="off"
          value={value || ""}
          // onChange={onChange}
          step={step}
          readOnly={readOnly}
          inputMode={inputMode}
          min={min}
          onBlur={onBlur}
          pattern={pattern}
          // onFocus={(e) => !disableSelectOnFocus && e.target.select()}
          {...input}
          onChange={onChange ? onChange : input?.onChange}
          onPaste={pasteHandler(onChange ? onChange : input?.onChange)}
          className={`w-full px-2 py-1 flex-grow text-sm focus:text-gray-900 ${textAlign[align]} bg-transparent outline-none ${className}`}
        />

        {units && (
          <span className="  flex items-center pr-2  cursor-pointer opacity-20 focus:opacity-100 hover:opacity-100">
            {units}
          </span>
        )}
        {ActionButton && (
          // <span className="  flex items-center pr-2  cursor-pointer opacity-20 focus:opacity-100 hover:opacity-100">
          <ActionButton />
          // </span>
        )}
      </div>
      {helperText && <div className="text-xs text-gray-600 mx-2">{helperText}</div>}
      {!!Helper && <Helper />}
      {meta?.touched && meta?.error && <span className="text-xs text-red-400 mx-2">{meta.error}</span>}
    </div>
  );
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case "UPDATE_INPUT":
      return { ...state, [payload.field]: payload.value };
    case "UPDATE_ALL":
      return { ...state, ...payload };
    case "SET_ADDRESS":
      return { ...state, ...payload };
    default:
      return state;
  }
};

export const CheckRequest = () => {
  const [state, dispatch] = React.useReducer(reducer, {
    amount: 25,
    name: "John Doe",
    address: "15026 1st ave s, Burien WA 98108",
    explanation: "Google Review",
  });

  const [loadingPDF, setLoadingPDF] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState("");

  const handleOnChange = (e) =>
    dispatch({
      type: "UPDATE_INPUT",
      payload: { field: e.target.name, value: e.target.value },
    });

  const modifyPdf = async (data, toDownload) => {
    // Fetch your existing PDF
    const baseUrl = window.location.origin.toString() + import.meta.env.BASE_URL;

    const pdf = {
      name: "pdf/CHECK REQUEST.pdf",
    };

    const url = baseUrl + pdf.name;
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed the Helvetica font
    const helveticaFont = await pdfDoc.embedFont("Helvetica");

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Draw text at specific x, y coordinates
    firstPage.drawText(`${data.amount}`, {
      x: 170,
      y: 652,
      size: 16,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(data.name, {
      x: 170,
      y: 620,
      size: 16,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    function parseAddress(address) {
      const index = address.indexOf(","); // Find the index of the first comma
      if (index === -1) {
        return [address, ""]; // If there's no comma, return the whole address as the first part and an empty string as the second part
      }
      const add1 = address.substring(0, index).trim(); // Extract the substring before the comma and trim any whitespace
      const add2 = address.substring(index + 1).trim(); // Extract the substring after the comma and trim any whitespace
      return [add1, add2]; // Return the two parts
    }

    const [add1, add2] = parseAddress(data.address);

    firstPage.drawText(add1, {
      x: 255,
      y: 582,
      size: 16,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(add2, {
      x: 220,
      y: 545,
      size: 16,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText(data.explanation, {
      x: 95,
      y: 345,
      size: 16,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    // ... Add other data similarly

    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();

    // Create a blob from the bytes
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    setPdfUrl(blobUrl);

    if (toDownload) {
      const now = new Date();

      return download(
        await pdfDoc.save(),
        `Check Request ${data.name} ${data.amount} ${getFormattedDate(now, " ")}.pdf`,
        "application/pdf"
      );
    }
  };

  return (
    <div className="text-black bg-white">
      <Link
        to="/"
        className="uppercase text-center items-center bg-white my-3 bg-opacity-10 hover:bg-opacity-25 text-xs py-1 rounded-lg w-96 mx-auto "
      >
        Go to Main
      </Link>
      <h1> CheckRequest</h1>
      <div className="flex flex-col text-black bg-white"></div>
      <Input
        label="Amount"
        name="amount"
        value={state.amount}
        placeholder="25"
        type="number"
        onChange={handleOnChange}
      />
      <Input label="name" name="name" value={state.name} placeholder="John Doe" onChange={handleOnChange} />
      <Input label="address" name="address" value={state.address} placeholder="25" onChange={handleOnChange} />
      <Input
        label="explanation"
        name="explanation"
        value={state.explanation}
        placeholder="25"
        onChange={handleOnChange}
      />
      <div>
        <button
          type="button"
          className="bg-indigo-700 text-white px-4 py-2 rounded my-2"
          onClick={async () => {
            setLoadingPDF(true);
            await modifyPdf(state, true);
            setLoadingPDF(false);
          }}
        >
          {loadingPDF ? "Loading" : "Get Check Request"}
        </button>
      </div>
      <div>
        <button onClick={() => modifyPdf(state)}>Modify PDF</button>
        {pdfUrl && <iframe src={pdfUrl} style={{ width: "100%", height: 500 }} />}
      </div>
    </div>
  );
};

async function fillPDF(data) {
  const baseUrl = window.location.origin.toString() + import.meta.env.BASE_URL;

  const pdf = {
    name: "pdf/CHECK REQUEST.pdf",
  };

  const formUrl = baseUrl + pdf.name;
  console.log({ formUrl, baseUrl });
  const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(formPdfBytes);

  const now = new Date();

  return download(
    await pdfDoc.save(),
    `Check Request ${data.name} ${data.amount} ${getFormattedDate(now, " ")}.pdf`,
    "application/pdf"
  );
}

function getFormattedDate(date, separator = "/") {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");

  return month + separator + day + separator + year;
}
