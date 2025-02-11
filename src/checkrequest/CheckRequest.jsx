import React from "react";
import {
  FaFilePdf,
  FaUser,
  FaMapMarkerAlt,
  FaDollarSign,
  FaInfoCircle,
} from "react-icons/fa";
import SpiffSelector from "./SpiffSelector";
import RecentRequests from "./RecentRequests";
import CheckInput from "./CheckInput";
import ImageUpload from "./ImageUpload";
import { modifyPdf, mergePdfRequests, downloadPdf } from "./utils";
import { spiffTemplates } from "./spifftemplates";
import { useAuth } from "../auth/AuthProvider";
import { MdCallSplit, MdClear, MdDeleteForever, MdHistory, MdRecentActors } from "react-icons/md";
import { FaPaperPlane } from "react-icons/fa6";

const RECENT_KEY = "recentCheckRequests";

const initialState = {
  amount: 25,
  name: "",
  address: "",
  spiffExplanation: "",
  detailsExplanation: "",
  coworkerName: "",
  coworkerAddress: "",
  spiffKey: "",
};

const CheckRequest = () => {
  const { currentUser, profile } = useAuth();
  const [state, dispatch] = React.useReducer((state, action) => {
    switch (action.type) {
      case "UPDATE_INPUT":
        return { ...state, [action.payload.field]: action.payload.value };
      case "UPDATE_ALL":
        return { ...state, ...action.payload };
      default:
        return state;
    }
  }, initialState);

  const [loadingPDF, setLoadingPDF] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [images, setImages] = React.useState([]);
  const [dropActive, setDropActive] = React.useState(false);

  // Spiff-related state
  const [selectedSpiffKey, setSelectedSpiffKey] =
    React.useState("googleReview");
  const [spiffRate, setSpiffRate] = React.useState(0);
  const [spiffCount, setSpiffCount] = React.useState(1);
  const [spiffSelection, setSpiffSelection] = React.useState("Current"); // "Current" or "Recent"
  const recentLoadedRef = React.useRef(false);

  // Split-related state
  const [splitMode, setSplitMode] = React.useState(false);

  // Recent check requests state
  const [recentRequests, setRecentRequests] = React.useState([]);

  // Load recent requests when spiffSelection becomes "Recent"
  React.useEffect(() => {
    if (spiffSelection === "Recent") {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecentRequests(JSON.parse(saved));
    }
  }, [spiffSelection]);

  // Prefill name and address from auth (runs only when currentUser or profile change)
  React.useEffect(() => {
    if (currentUser) {
      const prefillName =
        currentUser.displayName ||
        `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
      if (prefillName && !state.name) {
        dispatch({
          type: "UPDATE_INPUT",
          payload: { field: "name", value: prefillName },
        });
      }
      if (profile?.address && !state.address) {
        dispatch({
          type: "UPDATE_INPUT",
          payload: { field: "address", value: profile.address },
        });
      }
    }
  }, [currentUser, profile]);

  // When a spiff is selected (manually via dropdown or modal), update form values.
  React.useEffect(() => {
    if (selectedSpiffKey) {
      const template = spiffTemplates[selectedSpiffKey];
      const newRate = template.amount;
      setSpiffRate(newRate);
      if (!recentLoadedRef.current) {
        setSpiffCount(1);
        dispatch({
          type: "UPDATE_INPUT",
          payload: { field: "amount", value: newRate },
        });
      } else {
        updateAmount(newRate, spiffCount);
      }
      // Use description for the read-only explanation and template for the prefill text
      dispatch({
        type: "UPDATE_INPUT",
        payload: { field: "spiffExplanation", value: template.description },
      });
      dispatch({
        type: "UPDATE_INPUT",
        payload: { field: "detailsExplanation", value: template.template },
      });
      dispatch({
        type: "UPDATE_INPUT",
        payload: { field: "spiffKey", value: selectedSpiffKey },
      });
      if (!template.splitable) {
        setSplitMode(false);
        dispatch({
          type: "UPDATE_INPUT",
          payload: { field: "coworkerName", value: "" },
        });
        dispatch({
          type: "UPDATE_INPUT",
          payload: { field: "coworkerAddress", value: "" },
        });
      }
      recentLoadedRef.current = false;
      setSpiffSelection("Current");
    }
  }, [selectedSpiffKey]);
  // Do not include spiffCount here

  // When a recent request is selected, update the form (including spiffCount)
  const handleRecentSelect = (req) => {
    dispatch({ type: "UPDATE_ALL", payload: req });
    if (req.spiffKey) {
      // Set recentLoaded flag so that the spiff effect preserves the count.
      recentLoadedRef.current = true;
      setSelectedSpiffKey(req.spiffKey);
      const template = spiffTemplates[req.spiffKey];
      const count =
        req.spiffCount !== undefined
          ? req.spiffCount
          : req.amount / template.amount;
      setSpiffCount(count);
    }
    setSpiffSelection("Current");
  };

  const updateAmount = (newRate, newCount) => {
    dispatch({
      type: "UPDATE_INPUT",
      payload: { field: "amount", value: newRate * newCount },
    });
  };

  const handleRateChange = (e) => {
    const newRate = parseFloat(e.target.value) || 0;
    setSpiffRate(newRate);
    updateAmount(newRate, spiffCount);
  };

  const handleCountChange = (e) => {
    const newCount = parseInt(e.target.value) || 1;
    setSpiffCount(newCount);
    updateAmount(spiffRate, newCount);
  };

  const incrementCount = () => {
    setSpiffCount((prev) => {
      const newCount = prev + 1;
      updateAmount(spiffRate, newCount);
      return newCount;
    });
  };

  const decrementCount = () => {
    setSpiffCount((prev) => {
      const newCount = Math.max(1, prev - 1);
      updateAmount(spiffRate, newCount);
      return newCount;
    });
  };

  const handleOnChange = (e) => {
    dispatch({
      type: "UPDATE_INPUT",
      payload: { field: e.target.name, value: e.target.value },
    });
  };

  const handlePasteImage = async (e) => {
    e.preventDefault();
    const clipboardData =
      e.clipboardData || (e.nativeEvent && e.nativeEvent.clipboardData);
    if (clipboardData && clipboardData.items) {
      for (let i = 0; i < clipboardData.items.length; i++) {
        if (clipboardData.items[i].type.indexOf("image") !== -1) {
          const file = clipboardData.items[i].getAsFile();
          if (file) setImages((prev) => [...prev, file]);
        }
      }
    } else if (navigator.clipboard && navigator.clipboard.read) {
      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.indexOf("image") !== -1) {
              const blob = await item.getType(type);
              setImages((prev) => [...prev, blob]);
            }
          }
        }
      } catch (error) {
        console.error("Error reading clipboard:", error);
      }
    } else {
      console.warn("Clipboard data is not available.");
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const saveRecentRequest = (request) => {
    const updated = [request, ...recentRequests];
    setRecentRequests(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const removeRecentRequest = (index) => {
    const updated = recentRequests.filter((_, i) => i !== index);
    setRecentRequests(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const clearRecentRequests = () => {
    setRecentRequests([]);
    localStorage.removeItem(RECENT_KEY);
  };

  const PdfButton = () => (
    <button
      onClick={(e) =>
        window.open("/pdf/CHECK REQUEST.pdf", "_blank", "noopener,noreferrer")
      }
      className="flex items-center gap-2 text-xs hover:underline bg-white bg-opacity-0 hover:bg-opacity-15 transition-all sm:p-2 sm:px-4 p-1 rounded"
    >
      <FaFilePdf /> <span>PDF</span>
    </button>
  );

  // Include spiffKey and spiffCount in the PDF data
  const preparePdfData = (data) => ({
    ...data,
    explanation: data.detailsExplanation || "",
    spiffKey: data.spiffKey || selectedSpiffKey,
    spiffCount: spiffCount,
  });

  const getPdfFileName = () => {
    const firstName = state.name.split(" ")[0] || "Unknown";
    const coworkerFirstName =
      splitMode && state.coworkerName ? state.coworkerName.split(" ")[0] : "";
    const fullName =
      splitMode && coworkerFirstName
        ? `${firstName} & ${coworkerFirstName}`
        : firstName;
    const templateName = selectedSpiffKey
      ? spiffTemplates[selectedSpiffKey].name.replace(/\//g, "-")
      : "Custom";
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const datePart = `${month}-${day} ${hours}-${minutes}-${seconds}`;
    return `CHECK REQ ${fullName} - ${templateName} ${state.amount} ${datePart}.pdf`;
  };

  const handleGeneratePdf = async (data) => {
    setLoadingPDF(true);
    try {
      const pdfData = preparePdfData(data);
      const pdfBytes = await modifyPdf(pdfData, images);
      await downloadPdf(pdfBytes, pdfData, getPdfFileName());
      saveRecentRequest(pdfData);
    } catch (error) {
      console.error("Error generating PDF", error);
    }
    setLoadingPDF(false);
  };

  const handleSplit = async () => {
    if (!state.coworkerName || !state.coworkerAddress) {
      alert("Please enter both CoWorker Name and Address to split.");
      return;
    }
    if (selectedSpiffKey && !spiffTemplates[selectedSpiffKey].splitable) {
      alert("This spiff cannot be split.");
      return;
    }
    const halfAmount = state.amount / 2;
    const request1 = preparePdfData({ ...state, amount: halfAmount });
    const request2 = preparePdfData({
      ...state,
      amount: halfAmount,
      name: state.coworkerName,
      address: state.coworkerAddress,
    });
    setLoadingPDF(true);
    try {
      const pdfBytes1 = await modifyPdf(request1, images);
      const pdfBytes2 = await modifyPdf(request2, images);
      const mergedPdfBytes = await mergePdfRequests([pdfBytes1, pdfBytes2]);
      await downloadPdf(mergedPdfBytes, request1, getPdfFileName());
      saveRecentRequest(request1);
      saveRecentRequest(request2);
    } catch (error) {
      console.error("Error generating split PDF", error);
    }
    setLoadingPDF(false);
  };

  const renderForm = () => (
    <div>
      {selectedSpiffKey && (
        <div className="mb-2 p-2 bg-gray-800 text-white text-xs rounded">
          <span>{spiffTemplates[selectedSpiffKey].description}</span>
        </div>
      )}
      <div className="flex items-center  my-2">
        <div className="flex  items-center">

        <button
          onClick={decrementCount}
          className="flex items-center justify-center w-6 h-6 rounded-full text-xl leading-none transition-all text-white hover:bg-opacity-30 bg-opacity-15 bg-white"
          >
          -
        </button>
        <input
          type="number"
          value={spiffCount}
          onChange={handleCountChange}
          className="w-9  border border-gray-500 text-white rounded mx-1 px-2 text-right hover:bg-opacity-10 bg-opacity-5 bg-white"
          />
        <button
          onClick={incrementCount}
          className="flex items-center justify-center w-6 h-6 rounded-full text-xl leading-none transition-all text-white hover:bg-opacity-30 bg-opacity-15 bg-white"
          >
          +
        </button>
          </div>
        <span className="ml-2 lowercase text-white opacity-70  select-none whitespace-nowrap">
          {spiffTemplates[selectedSpiffKey]?.short
            ? spiffCount > 1
              ? `${spiffTemplates[selectedSpiffKey].short}s`
              : spiffTemplates[selectedSpiffKey].short
            : spiffCount > 1
            ? "spiffs"
            : "spiff"}
        </span>

        <label className=" text-white opacity-70  select-none md:hidden block mx-2">
          at
        </label>
        <label className=" text-white opacity-70  select-none hidden md:block">
          , with a rate of $
        </label>
        <input
          type="number"
          value={spiffRate}
          onChange={handleRateChange}
          className="w-12  border border-gray-500 text-white rounded mx-1 px-2 text-right hover:bg-opacity-10 bg-opacity-5 bg-white"
        />
        <label className=" text-white opacity-70  select-none hidden md:block">/per, is:</label>
        <label className=" text-white opacity-70  select-none md:hidden block">rate</label>
      </div>
      <CheckInput
        label="Amount, $"
        name="amount"
        value={state.amount}
        placeholder="Amount"
        type="number"
        onChange={handleOnChange}
        icon={<FaDollarSign />}
      />
      <CheckInput
        label="Full Name"
        name="name"
        value={state.name}
        placeholder="Primary Name"
        onChange={handleOnChange}
        icon={<FaUser />}
      />
      <CheckInput
        label="Address"
        name="address"
        value={state.address}
        placeholder="Primary Address"
        onChange={handleOnChange}
        icon={<FaMapMarkerAlt />}
      />
      <div className="my-2">
        <label className="block text-white">
          <input
            type="checkbox"
            checked={splitMode}
            onChange={(e) => setSplitMode(e.target.checked)}
            className="mr-2"
            disabled={
              selectedSpiffKey && !spiffTemplates[selectedSpiffKey].splitable
            }
          />
          Split Check Request
          {selectedSpiffKey && !spiffTemplates[selectedSpiffKey].splitable && (
            <span className="text-red-100 ml-2">
              (Not allowed for this spiff)
            </span>
          )}
        </label>
      </div>
      {splitMode && (
        <>
          <CheckInput
            label="CoWorker Name"
            name="coworkerName"
            value={state.coworkerName}
            placeholder="CoWorker Name"
            onChange={handleOnChange}
            icon={<FaUser />}
          />
          <CheckInput
            label="CoWorker Address"
            name="coworkerAddress"
            value={state.coworkerAddress}
            placeholder="CoWorker Address"
            onChange={handleOnChange}
            icon={<FaMapMarkerAlt />}
          />
        </>
      )}
      <CheckInput
        label="Details/Explanation"
        name="detailsExplanation"
        value={state.detailsExplanation}
        placeholder="Details/Explanation"
        onChange={handleOnChange}
        multiline={true}
        icon={<FaInfoCircle />}
      />
      <ImageUpload
        setImages={setImages}
        dropActive={dropActive}
        setDropActive={setDropActive}
        handlePasteImage={handlePasteImage}
      />
      {images.length > 0 && (
        <div className="my-2">
          <h3 className="text-white">Uploaded Images:</h3>
          <div className="flex flex-wrap gap-2">
            {images.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-20 h-20 object-cover border border-gray-500"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1"
                  onClick={() => removeImage(index)}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {errorMessage && (
        <div className="relative w-full text-sm p-2 mb-2 border border-red-500 bg-red-100 text-red-700 rounded">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage("")}
            className="absolute top-0 right-0 p-1"
          >
            <MdClear className="text-xl" />
          </button>
        </div>
      )}
      <div>
        <button
          type="button"
          onClick={
            splitMode ? handleSplit : async () => await handleGeneratePdf(state)
          }
          className="w-full bg-indigo-700 text-white flex items-center justify-center gap-2 px-4 py-2 rounded my-2 hover:bg-indigo-800 transition-colors"
        >
          {loadingPDF ? (
            "Loading..."
          ) : splitMode ? (
            <>
              <MdCallSplit className="text-xl" />
              <span>Generate Split Check Requests</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="text-xl" />
              <span>Get Check Request</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col mt-2 px-4 text-white">
      {/* HEADER */}
      <div className="flex items-center space-x-4 mb-2 ">
        {spiffSelection === "Current" ? (
          <>
            <SpiffSelector
              selectedSpiffKey={selectedSpiffKey}
              onSelectSpiff={(key) => setSelectedSpiffKey(key)}
            />

            <button
              onClick={() => setSpiffSelection("Recent")}
              className="md:px-3 px-1 md:py-2 py-1 text-sm flex items-center gap-1 rounded bg-white bg-opacity-0 hover:bg-opacity-10 transition-all text-white"
            >
             <MdHistory /> <span> Recent</span>
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to clear the form?")
                ) {
                  dispatch({ type: "UPDATE_ALL", payload: initialState });
                  setSelectedSpiffKey("googleReview");
                  setSpiffRate(spiffTemplates["googleReview"].amount);
                  setSpiffCount(1);
                  setImages([]); // This clears the uploaded images.
                }
              }}
              className="md:px-3 px-1 md:py-2 py-1 text-sm flex items-center gap-1 rounded bg-white bg-opacity-0 hover:bg-opacity-10 transition-all text-white"

            >
                           <MdDeleteForever /> <span> Clear</span>

            </button>
          </>
        ) : (<div className="flex-grow">

          <button
            onClick={() => setSpiffSelection("Current")}
            className="px-3 py-2 text-sm flex items-center gap-1 rounded bg-white bg-opacity-0 hover:bg-opacity-10 transition-all text-white"

            >
            &larr; Back to Edit
          </button>
            </div>
        )}
        <PdfButton />
      </div>

      {/* /HEADER */}
      {spiffSelection === "Current" ? (
        renderForm()
      ) : (
        <RecentRequests
          recentRequests={recentRequests}
          onSelectRecent={handleRecentSelect}
          onClearRecent={removeRecentRequest}
          onClearAll={clearRecentRequests}
        />
      )}
    </div>
  );
};

export default CheckRequest;
