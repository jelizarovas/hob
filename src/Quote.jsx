import React, { useReducer } from "react";
import { useHistory } from "react-router-dom";
import cuid from "cuid";
import {
  MdAdd,
  MdAddCircleOutline,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdCheckCircle,
  MdDelete,
  MdIndeterminateCheckBox,
} from "react-icons/md";
import { formatCurrency } from "./utils";
import { Link } from "react-router-dom";

const initialState = {
  listedPrice: 32040,
  discount: 500,
  sellingPrice: 31540,
  packages: {
    [cuid.slug()]: {
      label: "Vehicle Service Contract",
      value: 4495,
      include: true,
    },
    [cuid.slug()]: {
      label: "LoJack",
      value: 795,
      include: true,
    },
    [cuid.slug()]: {
      label: "PermaPlate",
      value: 1277,
      include: true,
    },
    [cuid.slug()]: {
      label: "Nas GAP",
      value: 995,
      include: true,
    },
    [cuid.slug()]: {
      label: "Rairdon Investment Package",
      value: 1995,
      include: true,
    },
  },
  accessories: {},
  tradeIns: {},
  salesTaxRate: 10.4,
  fees: {
    docfee: {
      label: "Doc Fee",
      value: 200,
      include: true,
    },
    other: {
      label: "License, Admin, Title",
      value: 901.5,
      include: true,
    },
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_NESTED_FIELD":
      const { field, key, subfield, value, include } = action;
      return {
        ...state,
        [field]: {
          ...state[field],
          [key]: {
            include: true,
            ...state[field][key],
            [subfield]: value,
          },
        },
      };
    case "DELETE_NESTED_FIELD":
      const newState = { ...state };

      // Check if the field exists and is an object
      if (newState[action.field] && typeof newState[action.field] === "object") {
        delete newState[action.field][action.key];
      }

      return newState;

    case "TOGGLE_INCLUDE":
      return {
        ...state,
        [action.field]: {
          ...state[action.field],
          [action.key]: {
            ...state[action.field][action.key],
            include: !state[action.field][action.key].include,
          },
        },
      };

    case "TOGGLE_ALL_INCLUDES":
      const fieldToUpdate = state[action.field];
      let updatedField;

      if (action.state === "check" || action.state === "intermediate") {
        updatedField = Object.fromEntries(
          Object.entries(fieldToUpdate).map(([key, item]) => [key, { ...item, include: true }])
        );
      } else if (action.state === "uncheck") {
        updatedField = Object.fromEntries(
          Object.entries(fieldToUpdate).map(([key, item]) => [key, { ...item, include: false }])
        );
      }

      return {
        ...state,
        [action.field]: updatedField,
      };

    default:
      return state;
  }
}

export const Quote = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  let history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [field, key, subfield] = name.split(".");

    if (key && subfield) {
      dispatch({ type: "SET_NESTED_FIELD", field, key, subfield, value });
    } else {
      // Top-level field
      dispatch({ type: "SET_FIELD", field: name, value });
    }
  };

  const handleAddField = (field) => (e) => {
    const newKey = cuid.slug(); // Generate a 6-character CUID
    dispatch({ type: "SET_NESTED_FIELD", field, key: newKey, value: "" });
  };

  const handleDeleteAddon = (name) => {
    const [field, key] = name.split(".");
    dispatch({ type: "DELETE_NESTED_FIELD", field, key });
  };

  const toggleInclude = (field, key) => {
    dispatch({
      type: "TOGGLE_INCLUDE",
      field,
      key,
    });
  };

  function determineCheckboxState(items) {
    const allChecked = Object.values(items).every((item) => item.include);
    const someChecked = Object.values(items).some((item) => item.include);

    if (allChecked) {
      return "uncheck";
    } else if (someChecked) {
      return "intermediate";
    } else {
      return "check";
    }
  }

  const [total, salesTax] = calculateTotal(state);

  // Use the state as needed
  return (
    <div className="container mx-auto py-2 flex space-y-2 flex-col ">
      <Link to="/">Go to Main</Link>
      <div>
        <div className="w-96 ">
          <Input name="listedPrice" value={state.listedPrice} onChange={handleChange} label="Listed Price" />
          <Input name="discount" value={state.discount} onChange={handleChange} label="Discount" />
          <Input name="sellingPrice" value={state.sellingPrice} onChange={handleChange} label="Selling Price" />
        </div>

        <div>
          <div className="flex items-center space-x-2 my-2">
            <button
              onClick={() => {
                const currentState = determineCheckboxState(state.packages);

                dispatch({
                  type: "TOGGLE_ALL_INCLUDES",
                  field: "packages",
                  state: currentState,
                });
              }}
              className="text-lg px-2 py-2 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg"
            >
              {determineCheckboxState(state.packages) === "check" ? (
                <MdCheckBoxOutlineBlank />
              ) : determineCheckboxState(state.packages) === "intermediate" ? (
                <MdIndeterminateCheckBox />
              ) : (
                <MdCheckBox />
              )}
            </button>
            <span>Packages</span>
            <button
              onClick={handleAddField("packages")}
              className="text-lg px-2 py-2 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg"
            >
              <MdAddCircleOutline />
            </button>
          </div>
          {state?.packages &&
            Object.entries(state.packages).map(([key, value], i) => (
              <div key={key} className="flex space-x-2 my-1 items-center ">
                <button
                  className="px-2 py-1 rounded-lg  "
                  onClick={() => {
                    toggleInclude("packages", key);
                  }}
                >
                  {value.include ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
                </button>
                <Input
                  name={`packages.${key}.label`}
                  value={state.packages[key].label}
                  onChange={handleChange}
                  type="text"
                  className=""
                />
                <Input
                  className="w-1/3"
                  name={`packages.${key}.value`}
                  value={state.packages[key].value}
                  onChange={handleChange}
                />
                <button className="px-2 py-1 rounded-lg " onClick={() => handleDeleteAddon(`packages.${key}`)}>
                  <MdDelete />
                </button>
              </div>
            ))}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <button onClick={handleAddField("accessories")} className="">
              <MdAddCircleOutline />
            </button>

            <span>Accessories</span>
          </div>
          {state?.accessories &&
            Object.entries(state.accessories).map(([key, value], i) => (
              <div key={key} className="flex space-x-2 my-1 items-center ">
                <button className="px-2 py-1 rounded-lg  " onClick={() => {}}>
                  <MdCheckBox />
                </button>
                <Input
                  name={`accessories.${key}.label`}
                  value={state.accessories[key].label}
                  onChange={handleChange}
                  type="text"
                  className=""
                />
                <Input
                  className="w-1/3"
                  name={`accessories.${key}.value`}
                  value={state.accessories[key].value}
                  onChange={handleChange}
                />
                <button className="w-16" onClick={() => handleDeleteAddon(`accessories.${key}`)}>
                  <MdDelete />
                </button>
              </div>
            ))}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <button onClick={handleAddField("fees")} className="">
              <MdAddCircleOutline />
            </button>

            <span>Fees</span>
          </div>
          {state?.fees &&
            Object.entries(state.fees).map(([key, value], i) => (
              <div key={key} className="flex space-x-2 my-1 items-center ">
                <button className="px-2 py-1 rounded-lg  " onClick={() => {}}>
                  <MdCheckBox />
                </button>
                <Input
                  name={`fees.${key}.label`}
                  value={state.fees[key].label}
                  onChange={handleChange}
                  type="text"
                  className=""
                />
                <Input
                  className="w-1/3"
                  name={`fees.${key}.value`}
                  value={state.fees[key].value}
                  onChange={handleChange}
                />
                <button className="w-16" onClick={() => handleDeleteAddon(`fees.${key}`)}>
                  <MdDelete />
                </button>
              </div>
            ))}
        </div>
      </div>
      <div>
        Sales Tax ({state?.salesTaxRate}%): {salesTax && formatCurrency(salesTax)}
      </div>
      <div>Total: {total && formatCurrency(total)}</div>
    </div>
  );
};

const Input = ({ name, value, label, Icon, onChange, type = "number", className = "", ...props }) => {
  return (
    <label className="flex flex-col text-left">
      <span className="text-[10px]">{label}</span>
      <div className="bg-white flex flex-row">
        {Icon && <span>{Icon}</span>}
        <input
          name={name}
          className={`bg-transparent px-2 py-0.5 text-black flex-grow outline-none ${className}`}
          type={type}
          onChange={onChange}
          value={value || ""}
        />
      </div>
    </label>
  );
};

const calculateTotal = (state) => {
  const sumValues = (items) => {
    if (!items || typeof items !== "object") {
      return 0;
    }

    return Object.values(items).reduce((sum, item) => {
      if (item.include) {
        const itemValue = parseFloat(item.value) || 0;
        return sum + itemValue;
      }
      return sum;
    }, 0);
  };

  const sellingPrice = parseFloat(state.sellingPrice) || 0;
  const sumPackages = sumValues(state.packages);
  const sumAccessories = sumValues(state.accessories);
  const sumTradeIns = sumValues(state.tradeIns);
  const sumFees = sumValues(state.fees);
  const salesTaxRate = parseFloat(state.salesTaxRate) || 0;

  const taxableAmount = sellingPrice - sumTradeIns + sumPackages + sumAccessories;
  const salesTax = (salesTaxRate / 100) * taxableAmount;

  const total = sellingPrice + sumPackages + sumAccessories + salesTax + sumFees;

  return [total.toFixed(2), salesTax.toFixed(2)]; // Formatting the total to two decimal places
};
