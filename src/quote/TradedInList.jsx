import React, { useState } from "react";
import cuid from "cuid";
import { QuoteInput } from "./QuoteInput";
import {
  MdAddCircleOutline,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDelete,
  MdIndeterminateCheckBox,
  MdKeyboardArrowRight,
} from "react-icons/md";
import NumberFlow from "@number-flow/react";

const TradeInCard = ({
  tradeIn,
  onChange,
  onDelete,
  dispatch,
  arrayIndex,
  isChecked = true,
  groupLabel = "tradein",
  groupName = "tradein",
  groupSum = "999",
}) => {
  const [isOpen, setOpen] = useState(true);

  // Inside TradeInCard.jsx (within the TradeInCard component):
  const handleVinBlur = (e) => {
    const vinValue = e.target.value.trim();
    // Only trigger lookup if VIN has exactly 17 characters
    if (vinValue.length === 17) {
      // For example, call your API to fetch vehicle info by VIN:
      fetchTradeInfoByVin(vinValue).then((tradeData) => {
        // Dispatch updates for fields such as year, make, model, trim, color, etc.
        // This assumes your reducer handles UPDATE_TRADEIN_FIELD for each field.
        Object.keys(tradeData).forEach((field) => {
          dispatch({
            type: "UPDATE_TRADEIN_FIELD",
            payload: { id: tradeIn.id, field, value: tradeData[field] },
          });
        });
      });
    }
  };

  const handleInputChange = (e) => {
    onChange(tradeIn.id, e);
  };

  const updateTradeInStatus = (status) => {
    dispatch({
      type: "UPDATE_TRADEIN_FIELD",
      payload: { id: tradeIn.id, field: "status", value: status },
    });
  };

  const confirmAndDelete = () => {
    if (window.confirm("Are you sure you want to delete this trade-in?")) {
      onDelete(tradeIn.id);
    }
  };

  return (
    <div className="  rounded mt-2 ">
      <div className="flex items-center space-x-2 mt-2  bg-white bg-opacity-20 rounded-lg">
        <button
          name="include"
          checked={tradeIn.include}
          onChange={handleInputChange}
          onClick={() => {
            dispatch({
              type: "TOGGLE_ALL_INCLUDES",
              field: groupName,
              state: isChecked,
            });
          }}
          className="text-lg px-2 py-2 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg print:hidden"
        >
          {isChecked === "check" ? (
            <MdCheckBoxOutlineBlank />
          ) : isChecked === "intermediate" ? (
            <MdIndeterminateCheckBox />
          ) : (
            <MdCheckBox />
          )}
        </button>
        <div
          onClick={() => setOpen((v) => !v)}
          title="can't see everything?"
          className="flex-grow flex truncate items-center  bg-white bg-opacity-0 hover:bg-opacity-20 transition-all rounded py-1 px-2 cursor-pointer select-none"
        >
          <MdKeyboardArrowRight
            className={`mx-1 text-xl ${
              isOpen ? "rotate-90" : ""
            } transition-all`}
          />
          <span className=" flex-grow truncate">
            {tradeIn.year &&
            tradeIn.make &&
            tradeIn.model &&
            tradeIn.vin &&
            tradeIn.vin.length === 17
              ? `Trade #${arrayIndex + 1}: ${tradeIn.year} ${tradeIn.make} ${
                  tradeIn.model
                } #${tradeIn.vin.slice(-8)}`
              : "New Trade-In"}
          </span>
          <span className="">
            <NumberFlow
              format={{
                style: "currency",
                currency: "USD",
                trailingZeroDisplay: "stripIfInteger",
              }}
              value={groupSum}
            />
          </span>
        </div>
        <div>
          <button
            onClick={confirmAndDelete}
            // onClick={handleAddField(groupName)}
            className="text-lg px-2 py-2 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg print:hidden"
          >
            <MdDelete />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mx-1 space-y-2 p-2 bg-white bg-opacity-10 rounded-b">
          <div className="flex  md:flex-nowrap gap-1">
            {/* @TODO MAKE IT FLEX GROW VIN */}

            <QuoteInput
              name="vin"
              type="text"
              label="VIN"
              value={tradeIn.vin}
              onChange={handleInputChange}
              onBlur={handleVinBlur}
              containerClassName="w-full  flex-grow"
            />
            <QuoteInput
              name="miles"
              type="text"
              label="Mileage"
              value={tradeIn.miles}
              onChange={handleInputChange}
              containerClassName="w-1/3 "
            />
          </div>

          <div className="grid grid-cols-2 gap-1">
            <QuoteInput
              name="year"
              type="text"
              label="Year"
              value={tradeIn.year}
              onChange={handleInputChange}
            />
            <QuoteInput
              name="make"
              type="text"
              label="Make"
              value={tradeIn.make}
              onChange={handleInputChange}
            />
            <QuoteInput
              name="model"
              type="text"
              label="Model"
              value={tradeIn.model}
              onChange={handleInputChange}
            />
            <QuoteInput
              name="trim"
              type="text"
              label="Trim"
              value={tradeIn.trim}
              onChange={handleInputChange}
            />
          </div>
          <QuoteInput
            name="color"
            type="text"
            label="Color"
            value={tradeIn.color}
            onChange={handleInputChange}
            className="w-full"
          />
          <div className="flex items-center">
            <div className="flex space-x-2">
              {["Paid Off", "Financed", "Leased"].map((statusOption) => (
                <TradeStatusChip
                  key={statusOption}
                  label={statusOption}
                  selected={tradeIn.status === statusOption}
                  onClick={() => updateTradeInStatus(statusOption)}
                />
              ))}
            </div>

         
          </div>
          {(tradeIn.status === "Financed" || tradeIn.status === "Leased") && (
            <div className="space-y-2">
              <QuoteInput
                name="lienholder"
                type="text"
                label="Lienholder"
                value={tradeIn.lienholder}
                onChange={handleInputChange}
              />
              <QuoteInput
                name="payoffAmount"
                type="text"
                label="Payoff Amount"
                value={tradeIn.payoffAmount}
                onChange={handleInputChange}
              />
              <QuoteInput
                name="payoffGoodThrough"
                type="date"
                label="Payoff Good Through"
                value={tradeIn.payoffGoodThrough}
                onChange={handleInputChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const TradeInList = ({ tradeIns, dispatch }) => {
  // Convert the tradeIns object to an array sorted by createdAt
  const tradeInsArray = Object.values(tradeIns || {}).sort(
    (a, b) => a.createdAt - b.createdAt
  );

  const handleTradeInChange = (id, e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    dispatch({
      type: "UPDATE_TRADEIN_FIELD",
      payload: { id, field: name, value: newValue },
    });
  };

  const handleAddTradeIn = () => {
    const newTradeIn = {
      id: cuid.slug(),
      vin: "",
      miles: "",
      year: "",
      make: "",
      model: "",
      trim: "",
      color: "",
      financed: false,
      lienholder: "",
      payoffAmount: "",
      payoffGoodThrough: "",
      include: true,
      createdAt: Date.now(),
    };
    dispatch({ type: "ADD_TRADEIN", payload: newTradeIn });
  };

  const handleDeleteTradeIn = (id) => {
    dispatch({ type: "DELETE_TRADEIN", payload: id });
  };

  return (
    <div className="mt-0">
      {/* <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">Trade-Ins</h3>
        <button
          onClick={handleAddTradeIn}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Add Trade-In
        </button>
      </div> */}
      <div>
        {tradeInsArray.map((tradeIn, index) => (
          <TradeInCard
            arrayIndex={index}
            key={tradeIn.id}
            tradeIn={tradeIn}
            onChange={handleTradeInChange}
            onDelete={handleDeleteTradeIn}
            dispatch={dispatch}
          />
        ))}
      </div>
    </div>
  );
};

export default TradeInList;

// A helper function to fetch vehicle details by VIN using the NHTSA API
const fetchTradeInfoByVin = async (vin) => {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.Results && data.Results.length > 0) {
      const result = data.Results[0];
      console.log({ result });
      return {
        year: result.ModelYear || "",
        make: result.Make || "",
        model: result.Model || "",
        trim: result.Trim || "",
        // Note: Color is not provided by the NHTSA API, so you may need to allow manual input.
      };
    }
  } catch (error) {
    console.error("Error fetching VIN data:", error);
  }
  return {};
};

const TradeStatusChip = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1 rounded-full text-xs border transition-colors ${
      selected
        ? "bg-blue-700 text-white border-blue-700"
        : "bg-white bg-opacity-10 text-white border-white"
    }`}
  >
    {label}
  </button>
);
