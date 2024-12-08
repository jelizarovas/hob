import React, { useState, useReducer, useEffect } from "react";
import cuid from "cuid";
import {
  MdAdd,
  MdAddCircleOutline,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdCheckCircle,
  MdClear,
  MdDelete,
  MdEdit,
  MdEmojiTransportation,
  MdIndeterminateCheckBox,
  MdInfo,
  MdKeyboardArrowRight,
  MdPrint,
  MdRestorePage,
} from "react-icons/md";
import {
  formatCurrency,
  getColorNameByCode,
  getGenericColor,
  parseAddress,
  parseMileage,
} from "./utils";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import { VINComponent, determinePrice } from "./vehicle/VehicleCard";
import PaymentMatrix from "./PaymentMatrix ";
import NumberFlow from "@number-flow/react";

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
      value: 995,
      include: true,
    },
    [cuid.slug()]: {
      label: "GAP",
      value: 995,
      include: true,
    },
    [cuid.slug()]: {
      label: "Rairdon Investment Package",
      value: 1995,
      include: true,
    },
    [cuid.slug()]: {
      label: "Dealer Prep",
      value: 695,
      include: true,
    },
  },
  accessories: {
    [cuid.slug()]: {
      label: "All Weather Mats",
      value: 270,
      include: false,
    },
  },
  tradeIns: {},
  salesTaxRate: 10.5,
  fees: {
    docfee: {
      label: "Doc Fee",
      value: 200,
      include: true,
    },
    other: {
      label: "Estimated Licensing Fees",
      value: 899,
      include: true,
    },
  },
  downPayment: 2000,
  apr: 8.99, // Annual Percentage Rate as a percentage (e.g., 3.99%)
  term: 72, // Term in months (e.g., 60 months)
  amountFinanced: 0, // Placeholder for now
  totalAmountPaid: 0, // Placeholder for now
  monthlyPayment: 0, // Placeholder for now
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "UPDATE_PARAM":
      return { ...state, [action.payload.key]: action.payload.value };
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
      if (
        newState[action.field] &&
        typeof newState[action.field] === "object"
      ) {
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
          Object.entries(fieldToUpdate).map(([key, item]) => [
            key,
            { ...item, include: true },
          ])
        );
      } else if (action.state === "uncheck") {
        updatedField = Object.fromEntries(
          Object.entries(fieldToUpdate).map(([key, item]) => [
            key,
            { ...item, include: false },
          ])
        );
      }
      return {
        ...state,
        [action.field]: updatedField,
      };

    case "UPDATE_PRICES":
      const delta = action.payload.listPrice - action.payload.sellingPrice;
      if (delta === 0) {
        return {
          ...state,
          listedPrice: action.payload.listPrice,
          sellingPrice: action.payload.sellingPrice,
          discount: 0,
        };
      } else {
        return {
          ...state,
          listedPrice: action.payload.listPrice,
          sellingPrice: action.payload.sellingPrice,
          discount: delta,
        };
      }
    case "RESET_STATE":
      return action.payload; // Replace with the new state
    default:
      return state;
  }
}

export const Quote = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showTradeIn, setShowTradeIn] = useState(false);
  const {
    search,
    state: { vehicle },
  } = useLocation();
  const [state, dispatch] = useLocalStorage(reducer, initialState, vehicle);

 

  const queryParams = new URLSearchParams(search);
  const listPrice = parsePrice(queryParams.get("listPrice"));
  const sellingPrice = parsePrice(queryParams.get("sellingPrice"));
  React.useEffect(() => {
    if (listPrice !== null && sellingPrice !== null) {
      dispatch({
        type: "UPDATE_PRICES",
        payload: { listPrice, sellingPrice },
      });
    }
  }, [listPrice, sellingPrice]);

  React.useEffect(() => {
    const listedPrice = parseFloat(state.listedPrice) || 0;
    const discount = parseFloat(state.discount) || 0;

    const newSellingPrice = listedPrice - discount;

    if (state.sellingPrice !== newSellingPrice) {
      dispatch({
        type: "SET_FIELD",
        field: "sellingPrice",
        value: newSellingPrice.toString(),
      });
    }
  }, [state.listedPrice, state.discount]);

  let history = useHistory();

  const handleNavigation = async () => {
    setIsLoading(true); // Show loading indicator

    try {
      // Process the quote data
      const processedDealData = processQuote(state);

      // Navigate to the next page with processed data
      history.push("/dev/pencil", { dealData: processedDealData, vehicle });
    } catch (error) {
      console.error("Error processing quote:", error);
      // Handle error (e.g., show a message to the user)
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

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



  const [
    total,
    salesTax,
    sumPackages,
    sumAccessories,
    sumTradeIns,
    sumFees,
    amountFinanced,
    totalAmountPaid,
    monthlyPayment,
  ] = calculateTotal(state);

  // Use the state as needed
  return (
    <>
      <div className="container mx-auto py-2 flex space-y-2 flex-col  print:text-black">
        <div className="flex w-96 mx-auto space-x-2 print:hidden">
          <Link
            to="/"
            className="uppercase text-center flex justify-center items-center bg-white bg-opacity-10 hover:bg-opacity-25 text-xs py-1 rounded-lg w-96 mx-auto "
          >
            Back
          </Link>
          <button
            onClick={() =>
              dispatch({ type: "RESET_STATE", payload: initialState })
            }
            className="uppercase flex justify-center text-center px-2 gap-2 items-center bg-white bg-opacity-10 hover:bg-opacity-25 text-xs py-1 rounded-lg w-24 mx-auto"
          >
            <span>Reset</span>
          </button>
          <button
            onClick={() => setShowTradeIn((v) => !v)}
            className={`uppercase flex justify-center text-center px-2 gap-2 text-nowrap items-center bg-white ${
              showTradeIn ? "bg-opacity-40" : "bg-opacity-10"
            } hover:bg-opacity-25 text-xs py-1 rounded-lg w-24 mx-auto`}
          >
            <span>Trade in</span>
          </button>
          <button
            onClick={handleNavigation}
            className="uppercase text-center items-center bg-white bg-opacity-10 hover:bg-opacity-25 text-xs py-1 rounded-lg w-96 mx-auto"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? "Processing..." : "Pencil"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex space-x-1 items-center bg-white bg-opacity-10  px-2 py-1 transition-all  hover:bg-opacity-20 rounded cursor-pointer"
          >
            {" "}
            <MdPrint /> <span>Print</span>
          </button>
        </div>
        {/* <VehiclePrice /> */}
        <div className=" w-96 mx-auto">
          <div className="bg-white bg-opacity-20 rounded-lg flex flex-col print:flex-col w-full justify-between px-2 pt-1 pb-3 space-x-2 ">
            <div className="flex">
              <div className="mr-2">
                <img src={vehicle.thumbnail} className="w-16 h-10 rounded" />
              </div>
              <div className="flex flex-col  w-full px-1">
                <div className="flex justify-between items-center w-full">
                  <a
                    href={vehicle?.link}
                    target="_blank"
                    className="hover:underline"
                  >
                    {vehicle?.year} {vehicle?.make} {vehicle?.model}{" "}
                    {vehicle?.trim}
                  </a>
                  <span className="uppercase text-xs opacity-50">
                    {vehicle?.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs opacity-50">{vehicle?.vin}</span>
                  <span className="text-xs opacity-50">
                    {vehicle?.miles} miles
                  </span>
                  <span className="text-xs opacity-50">
                    {vehicle?.ext_color}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-between w-full">
              <Input
                name="listedPrice"
                value={state.listedPrice}
                onChange={handleChange}
                label="List / MSRP"
                className="w-28 text-right"
              />
              <Input
                name="discount"
                value={state.discount}
                onChange={handleChange}
                label="Discount"
                className="w-28 text-right"
              />
              <Input
                name="sellingPrice"
                value={state.sellingPrice}
                onChange={handleChange}
                label="Selling"
                className="w-28 text-right"
              />
            </div>
          </div>
          {showTradeIn && (
            <div className="bg-white items-center mt-2 bg-opacity-20 rounded-lg flex w-full justify-between px-2 pt-1 pb-3 space-x-2 ">
              <Input
                name="tradeInAllowance"
                value={state.tradeInAllowance}
                onChange={handleChange}
                label="Trade Allowance"
                className="w-28 text-right"
              />
              <Input
                name="tradeInPayoff"
                value={state.tradeInPayoff}
                onChange={handleChange}
                label="Payoff"
                className="w-28 text-right"
              />
              <div className="text-sm flex flex-col w-28 text-right">
                <div className="flex flex-col">
                  <span className="text-[8px] leading-none">Total Trade</span>
                  <span> {sumTradeIns}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] leading-none"> Tax credit:</span>
                  <span>
                    {" "}
                    {(Number(state.tradeInAllowance || 0) *
                      Number(state.salesTaxRate || 0)) /
                      100}
                  </span>
                </div>
              </div>
            </div>
          )}

          <QuoteGroup
            data={state.packages}
            groupName="packages"
            groupLabel="Packages"
            groupSum={sumPackages}
            determineCheckboxState={determineCheckboxState}
            handleAddField={handleAddField}
            toggleInclude={toggleInclude}
            handleDeleteAddon={handleDeleteAddon}
            handleChange={handleChange}
            dispatch={dispatch}
          />
          <QuoteGroup
            data={state.accessories}
            groupName="accessories"
            groupLabel="Accessories"
            groupSum={sumAccessories}
            determineCheckboxState={determineCheckboxState}
            handleAddField={handleAddField}
            toggleInclude={toggleInclude}
            handleDeleteAddon={handleDeleteAddon}
            handleChange={handleChange}
            dispatch={dispatch}
          />
          <QuoteGroup
            data={state.fees}
            groupName="fees"
            groupLabel="Fees"
            groupSum={sumFees}
            determineCheckboxState={determineCheckboxState}
            handleAddField={handleAddField}
            toggleInclude={toggleInclude}
            handleDeleteAddon={handleDeleteAddon}
            handleChange={handleChange}
            dispatch={dispatch}
          />

          <div className="rounded-lg bg-white bg-opacity-20   my-2 flex items-center flex-row">
            <button className="text-lg px-2 py-2 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg opacity-5 print:hidden">
              <MdCheckBox />
            </button>
            <div className="w-full flex items-center space-x-2 px-2">
              <span className="whitespace-nowrap  flex-grow">Sales Tax </span>
              <Input
                name="salesTaxRate"
                value={state.salesTaxRate}
                onChange={handleChange}
                className="w-16 text-right"
              />
              <span className="opacity-50">%</span>
            </div>
            <span className="whitespace-nowrap px-2 w-32 text-right">
            <NumberFlow
                        format={{
                          style: "currency",
                          currency: "USD",
                          trailingZeroDisplay: "stripIfInteger",
                        }}
                        value={salesTax}
                      />
            </span>
            <button className="text-lg px-2 py-2 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg opacity-5 print:hidden">
              <MdEdit />
            </button>
          </div>
          <div className="rounded-lg bg-white bg-opacity-10 py-2   my-2 flex items-center flex-row font-bold">
            <div className="text-lg px-2 py-2 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg opacity-0">
              <MdCheckBox />
            </div>
            <span className="whitespace-nowrap px-2 flex-grow">Total OTD</span>

            <span className="whitespace-nowrap px-2 w-32 text-right">
            <NumberFlow
                        format={{
                          style: "currency",
                          currency: "USD",
                          trailingZeroDisplay: "stripIfInteger",
                        }}
                        value={total}
                      />
            </span>
            <div className="text-lg px-2 py-2 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg opacity-0">
              <MdEdit />
            </div>
          </div>

         

          <PaymentMatrix totalOTD={total} />
        </div>
      </div>
    </>
  );
};

const Input = ({
  name,
  value,
  label,
  Icon,
  onChange,
  type = "number",
  className = "",
  ...props
}) => {
  return (
    <label className="flex flex-col text-left print:text-black print:flex-row">
      <span className="text-[10px] print:text-sm">{label}</span>
      <div className="bg-white bg-opacity-5 hover:bg-opacity-50 transition-all rounded-md text-sm flex flex-row">
        {Icon && <span>{Icon}</span>}
        <input
          name={name}
          className={`bg-transparent px-2 py-1 text-white print:text-black flex-grow outline-none  ${className} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
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
  const sumTradeIns =
    Number(state.tradeInAllowance) - Number(state.tradeInPayoff) || 0;
  const sumFees = sumValues(state.fees);
  const salesTaxRate = parseFloat(state.salesTaxRate) || 0;

  console.log("GAP", getGapAmount(state.packages));

  const taxableAmount =
    sellingPrice -
    sumTradeIns +
    (sumPackages - getGapAmount(state.packages)) +
    sumAccessories;
  const salesTax = (salesTaxRate / 100) * taxableAmount;

  const total =
    sellingPrice +
    sumPackages +
    sumAccessories +
    salesTax +
    sumFees -
    sumTradeIns;
  const downPayment = parseFloat(state.downPayment) || 0;
  const fin = calculateLoanDetails(
    total - downPayment || 0,
    state?.apr || 0,
    state?.term || 0
  );

  return [
    total.toFixed(2),
    salesTax.toFixed(2),
    sumPackages.toFixed(2),
    sumAccessories.toFixed(2),
    sumTradeIns.toFixed(2),
    sumFees.toFixed(2),
    fin.amountFinanced,
    fin.totalAmountPaid,
    fin.monthlyPayment,
  ]; // Formatting the total to two decimal places
};

const calculateLoanDetails = (amountFinanced, apr, term) => {
  const monthlyRate = apr / 100 / 12;
  const monthlyPayment =
    monthlyRate !== 0
      ? (amountFinanced * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term))
      : amountFinanced / term;
  const totalAmountPaid = monthlyPayment * term;

  return {
    amountFinanced: amountFinanced.toFixed(2),
    totalAmountPaid: totalAmountPaid.toFixed(2),
    monthlyPayment: monthlyPayment.toFixed(2),
  };
};

const QuoteGroup = ({
  data,
  groupName,
  groupLabel,
  groupSum,
  determineCheckboxState,
  handleAddField,
  toggleInclude,
  handleDeleteAddon,
  handleChange,
  dispatch,
}) => {
  const [isOpen, setOpen] = React.useState(true);
  const isChecked = determineCheckboxState(data);
  console.log(Object.keys(data).length, { data });

  return (
    <div
      className={`flex flex-col  ${
        isChecked === "uncheck" || isChecked === "intermediate"
          ? Object.keys(data).length === 0
            ? "print:hidden"
            : ""
          : "print:hidden"
      }`}
    >
      <div className="flex items-center space-x-2 mt-2  bg-white bg-opacity-20 rounded-lg">
        <button
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
          className="flex-grow flex justify-between items-center w-full bg-white bg-opacity-0 hover:bg-opacity-20 transition-all rounded py-1 px-2 cursor-pointer select-none"
        >
          <MdKeyboardArrowRight
            className={`mx-1 text-xl ${
              isOpen ? "rotate-90" : ""
            } transition-all`}
          />
          <span className=" w-full"> {groupLabel}</span>
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
            onClick={handleAddField(groupName)}
            className="text-lg px-2 py-2 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg print:hidden"
          >
            <MdAddCircleOutline />
          </button>
        </div>
      </div>
      <div className="mx-2 bg-white bg-opacity-10 rounded-b-lg ">
        {data &&
          isOpen &&
          Object.entries(data).map(([key, value], i) => (
            <div
              key={key}
              className={`flex space-x-2 px-2 my-1 items-center bg-white bg-opacity-0 hover:bg-opacity-5 ${
                value.include ? "" : "print:hidden"
              }  `}
            >
              <button
                className={`px-2 py-2 rounded-lg bg-white bg-opacity-0 transition-all hover:bg-opacity-20 print:hidden  `}
                onClick={() => {
                  toggleInclude(groupName, key);
                }}
              >
                {value.include ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
              </button>
              <Input
                name={`${groupName}.${key}.label`}
                value={data[key].label}
                onChange={handleChange}
                type="text"
                className=""
              />
              <Input
                className="w-1/4 text-right"
                name={`${groupName}.${key}.value`}
                value={data[key].value}
                onChange={handleChange}
              />
              <button
                className="px-2 py-2 rounded-lg bg-white bg-opacity-0 transition-all hover:bg-opacity-20   print:hidden"
                onClick={() => handleDeleteAddon(`${groupName}.${key}`)}
              >
                <MdDelete />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

const api = {
  name: "Rairdon",
  "X-Algolia-API-Key": "ec7553dd56e6d4c8bb447a0240e7aab3",
  "X-Algolia-Application-Id": "V3ZOVI2QFZ",
  index: "rairdonautomotivegroup_production_inventory_low_to_high",
};

function getVehicleDataByVINNumber(vin) {
  return fetch(
    `https://${api["X-Algolia-Application-Id"]}-dsn.algolia.net/1/indexes/${api.index}/query`,
    {
      headers: {
        "X-Algolia-API-Key": api["X-Algolia-API-Key"],
        "X-Algolia-Application-Id": api["X-Algolia-Application-Id"],
      },
      method: "POST",
      body: JSON.stringify({
        hitsPerPage: 1,
        query: vin,
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      return data.hits[0];
    });
}

const VehiclePrice = (props) => {
  const { vin } = useParams();
  const [v, setV] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getVehicleDataByVINNumber(vin);
        setV(data);
      } catch (error) {
        // Handle error if the data fetching fails
        console.error("Error fetching vehicle data:", error);
      }
    };

    if (isObjectEmpty(v)) {
      fetchData();
    }
  }, [vin, v]);

  const backgroundStyle = {
    backgroundImage: `url(${v?.thumbnail})`,
    backgroundSize: "cover",
    backgroundPosition: "center right",
  };

  return (
    <div className="w-96 print:w-full mx-auto">
      <div
        className="w-full max-w-full rounded-lg overflow-hidden px-4 flex  flex-row  print:my-1 print:px-2 print:py-1   border border-white  hover:bg-opacity-20 transition-all border-opacity-20 print:border-opacity-100 md:rounded 
         "
      >
        <div
          style={backgroundStyle}
          className="w-24 h-16 print:w-48 print:h-36  relative  flex-shrink-0 overflow-hidden hover:scale-105 transition-all "
        >
          <img
            src={v?.thumbnail}
            alt="car"
            className="w-48 hidden print:block"
          />
          {/* <div className="text-[10px] print:text-sm px-1 py-0.5 flex justify-between absolute w-full bg-black bg-opacity-80 left-0   bottom-0  leading-none">
            <span
              className={`${
                v?.days_in_stock > 60
                  ? "text-red-400"
                  : v?.days_in_stock > 30
                  ? "text-orange-400"
                  : ""
              }`}
            >
              {" "}
              {v?.days_in_stock} days
            </span>
            <span>{!!v?.miles && parseMileage(v?.miles)}</span>
          </div> */}
          {!!v?.miles && parseMileage(v.miles) && (
            <div
              title={v.miles}
              className="text-[10px]  print:text-sm px-1 py-0.5 absolute bg-black bg-opacity-80 right-0   bottom-0  leading-none"
            >
              {" "}
            </div>
          )}
        </div>
        <div className="flex flex-row justify-between items-start flex-grow  truncate px-1">
          <div className="flex flex-col flex-shrink w-full  h-full justify-between px-1">
            <div className="flex flex-col   text-sm">
              <span className="text-[8px]  print:text-sm leading-none pt-0.5 opacity-50 select-none text-left  ">
                {v?.type}
              </span>
              <span
                title={`${v?.year} ${v?.make} ${v?.model} ${v?.trim}`}
                className="leading-none  whitespace-normal cursor-pointer"
              >
                {`${v?.year} ${v?.make} ${v?.model}`}{" "}
                <span className="opacity-40">{v?.trim}</span>
              </span>
            </div>
            {/* <div className="flex space-x-2 flex-grow text-[8px]  print:text-sm   pt-1 opacity-50 print:opacity-90 ">
              <span className="leading-none truncate">
                <span title={v?.ext_color_generic}>{getGenericColor(getColorNameByCode(v?.ext_color_generic))}</span>{" "}
                <span title={v.ext_color}>{v?.ext_color && `- ${getColorNameByCode(v.ext_color)}`}</span>{" "}
                {v?.int_color && `   w/ ${v.int_color} interior`}
              </span>
            </div> */}

            <div className="flex items-center  justify-between">
              <div className="flex justify-between text-xs w-full ">
                <div className="text-sm leading-none">
                  {v?.vin && <VINComponent vin={v?.vin} />}
                  {/* {v?.vin && "#" + v.vin.slice(-8)} */}
                </div>
              </div>
            </div>
          </div>

          {/* <div className="flex justify-between text-xs w-full ">
        <div className="text-sm ">{v?.doors}</div>
        <div className="text-xs">{v?.city_mpg} {v?.hw_mpg}</div>
      </div> */}
        </div>

        {v?.our_price && (
          <div
            className="flex  flex-col justify-between  flex-shrink-0    px-0.5 w-20 print:w-32 pb-1"
            onClick={() =>
              console.log(v?.our_price_label, v?.our_price, v?.msrp)
            }
          >
            {v.msrp != 0 && (
              <div className="flex flex-col  print:space-x-2   justify-between text-right  text-sm">
                <span className="text-[8px] print:text-sm leading-none pt-0.5 opacity-50 print:opacity-80 select-none text-left ml-1 ">
                  MSRP
                </span>
                <span className="leading-none print:leading-normal cursor-pointer">
                  {formatCurrency(v.msrp)}
                </span>
              </div>
            )}
            <div className="flex flex-col  text-right  print:space-x-2   text-sm">
              {v?.our_price != v?.msrp && (
                <>
                  <span className="text-[8px] print:text-sm leading-none print:leading-normal pt-0.5 opacity-50 print:opacity-80 select-none text-left ml-1  ">
                    {v.our_price_label}
                  </span>

                  <span className="leading-none cursor-pointer ">
                    {" "}
                    {determinePrice(v.our_price)}
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-col text-right   text-sm">
              {v?.location && (
                <span
                  tite={v.location}
                  onClick={() => console.log(parseAddress(v.location))}
                  className="leading-none cursor-pointer truncate text-[8px] print:text-sm print:whitespace-nowrap print:overflow-visible print:text-right "
                >
                  {parseAddress(v.location)?.name ||
                    parseAddress(v.location)?.value ||
                    ""}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function isObjectEmpty(obj) {
  if (typeof obj !== "object" || obj === null) {
    return true; // Treat non-object values as empty
  }

  return Object.keys(obj).length === 0;
}

function getGapAmount(packages) {
  // Normalize the search terms for comparison
  const searchTerms = ["gap", "nas gap"];

  // Iterate over the packages object
  for (const key in packages) {
    if (packages.hasOwnProperty(key)) {
      const pkg = packages[key]; // Use 'pkg' to avoid reserved word conflict
      // Normalize the label for comparison and check the 'include' property
      const labelNormalized = pkg?.label?.toLowerCase() || "";
      if (
        searchTerms.some((term) => labelNormalized.includes(term)) &&
        pkg.include
      ) {
        return pkg.value; // Return the value if a match is found and 'include' is true
      }
    }
  }

  // Return 0 if no matching label is found or 'include' is not true
  return 0;
}

//SAMPLE STATE

const sample = {
  listedPrice: 59750,
  discount: "500",
  sellingPrice: "59250",
  packages: {
    jsl3oi3: {
      label: "Vehicle Service Contract",
      value: 4495,
      include: true,
    },
    jsm3oxo: {
      label: "LoJack",
      value: 795,
      include: true,
    },
    jsn3o9p: {
      label: "PermaPlate",
      value: 995,
      include: true,
    },
    jso3oud: {
      label: "GAP",
      value: 995,
      include: true,
    },
    jsp3o14: {
      label: "Rairdon Investment Package",
      value: 1995,
      include: true,
    },
    jsq3okl: {
      label: "Dealer Prep",
      value: 695,
      include: true,
    },
  },
  accessories: {
    jsr3osj: {
      label: "All Weather Mats",
      value: 270,
      include: true,
    },
  },
  tradeIns: {},
  salesTaxRate: 10.5,
  fees: {
    docfee: {
      label: "Doc Fee",
      value: 200,
      include: true,
    },
    other: {
      label: "License, Admin, Title",
      value: 899,
      include: true,
    },
  },
  downPayment: 2000,
  apr: 8.99,
  term: 72,
  amountFinanced: 0,
  totalAmountPaid: 0,
  monthlyPayment: 0,
  tradeInAllowance: "28000",
  tradeInPayoff: "17000",
};

function processQuote(quote) {
  // 1. Listed Price
  const listedPrice = parseFloat(quote.listedPrice) || 0;

  // 2. Discount
  const discount = parseFloat(quote.discount) || 0;

  // 3. Selling Price
  const sellingPrice = parseFloat(quote.sellingPrice) || 0;

  // 4. Packages
  const includedPackages = Object.values(quote.packages)
    .filter((pkg) => pkg.include)
    .map((pkg) => ({ label: pkg.label, amount: `$${pkg.value.toFixed(2)}` }));
  const packagesTotal = includedPackages.reduce(
    (total, pkg) => total + parseFloat(pkg.amount.replace("$", "")),
    0
  );

  // 5. Accessories
  const includedAccessories = Object.values(quote.accessories)
    .filter((acc) => acc.include)
    .map((acc) => ({ label: acc.label, amount: `$${acc.value.toFixed(2)}` }));
  const accessoriesTotal = includedAccessories.reduce(
    (total, acc) => total + parseFloat(acc.amount.replace("$", "")),
    0
  );

  // 6. Fees
  const includedFees = Object.values(quote.fees)
    .filter((fee) => fee.include)
    .map((fee) => ({ label: fee.label, amount: `$${fee.value.toFixed(2)}` }));
  const feesTotal = includedFees.reduce(
    (total, fee) => total + parseFloat(fee.amount.replace("$", "")),
    0
  );

  // 7. Subtotal
  const salesSubtotal =
    sellingPrice + packagesTotal + accessoriesTotal + feesTotal;

  // 8. Amount Financed
  // const downPayment = parseFloat(quote.downPayment) || 0;
  const amountFinanced = salesSubtotal; //- downPayment;

  // 9. Payment Options Matrix
  const termHeaders = [
    { payments: 48, type: "monthly", apr: 9.9 },
    { payments: 60, type: "monthly", apr: 9.9 },
    { payments: 72, type: "monthly", apr: 9.9 },
  ];

  const calculatePayment = (principal, apr, term) => {
    const monthlyRate = apr / 100 / 12;
    return (
      (principal * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -term))
    ).toFixed(2);
  };

  const calculatedPayments = [
    termHeaders.map((term) =>
      calculatePayment(amountFinanced, term.apr, term.payments)
    ),
    termHeaders.map((term) =>
      calculatePayment(amountFinanced - 200, term.apr, term.payments)
    ),
    termHeaders.map((term) =>
      calculatePayment(amountFinanced - 4000, term.apr, term.payments)
    ),
  ];

  // Construct the final dealData object
  const dealItems = [
    { label: "Listed Price", amount: `$${listedPrice.toFixed(2)}` },
    ...(discount > 0
      ? [{ label: "Discount", amount: `$${discount.toFixed(2)}` }]
      : []),
    { label: "Selling Price", amount: `$${sellingPrice.toFixed(2)}` },
    ...includedAccessories,
    ...includedPackages,
    ...includedFees,
    { label: "Sales Subtotal", amount: `$${salesSubtotal.toFixed(2)}` },
    // { label: "Down Payment", amount: `$${downPayment.toFixed(2)}` },
    {
      label: "Amount Financed",
      amount: `$${amountFinanced.toFixed(2)}`,
      isBold: true,
    },
  ];

  return {
    id: "59122",
    items: dealItems,
    paymentOptions: {
      downPaymentOptions: ["$0.00", "$2000.00", "$4000.00"],
      termHeaders,
      calculatedPayments,
    },
  };
}

// Example Usage
// const processedDealData = processQuote(sample);
// console.log(processedDealData);

const useLocalStorage = (reducer, initialState, vehicle) => {
  const key = vehicle?.vin ? `quoteState_${vehicle.vin}` : `quoteState_default`;

  // Initialize state from localStorage or initialState
  const initializeState = () => {
    const savedState = JSON.parse(localStorage.getItem(key));
    return savedState || initialState;
  };

  const [state, dispatch] = useReducer(reducer, {}, initializeState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);

  // Reset state if the vehicle changes and has a `vin`
  useEffect(() => {
    if (vehicle?.vin) {
      const savedState = JSON.parse(localStorage.getItem(key)) || initialState;
      dispatch({ type: "RESET_STATE", payload: savedState });
    }
  }, [vehicle?.vin]); // Only reset if the `vin` changes

  return [state, dispatch];
};

export default useLocalStorage;

const parsePrice = (price) => {
  if (price === "call") return "Call for Price";
  const value = parseFloat(price);
  return isNaN(value) ? null : value;
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