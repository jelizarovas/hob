import React, { useReducer } from "react";
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
  MdIndeterminateCheckBox,
  MdPrint,
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
      label: "GAP",
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

    default:
      return state;
  }
}

export const Quote = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { search } = useLocation();

  const parsePrice = (price) => {
    if (price === "call") return "Call for Price";
    const value = parseFloat(price);
    return isNaN(value) ? null : value;
  };

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
            className="uppercase text-center items-center bg-white bg-opacity-10 hover:bg-opacity-25 text-xs py-1 rounded-lg w-96 mx-auto "
          >
            Go to Main
          </Link>
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
          <div className="bg-white bg-opacity-20 rounded-lg flex print:flex-col w-full justify-between px-2 pt-1 pb-3 space-x-2 ">
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
              {salesTax && formatCurrency(salesTax)}{" "}
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
              {total && formatCurrency(total)}{" "}
            </span>
            <div className="text-lg px-2 py-2 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg opacity-0">
              <MdEdit />
            </div>
          </div>

          <div className="flex flex-col">
            <select className="text-black">
              <option>Finance</option> <option>Cash</option>
              <option>Lease</option>
            </select>

            <span>Term & APR options</span>
            <div className="flex gap-2">
              {[
                { term: 48, apr: 6.99 },
                { term: 60, apr: 7.99 },
                { term: 72, apr: 8.99 },

              ].map((option, i) => (
                <div className="flex flex-col my-2  rounded w-full">
                  <div className="bg-white bg-opacity-20 rounded -mx-0 px-0 py-1 text-xs flex items-center">
                 <span className="px-2"> <MdCheckBox /></span>
                    
                    <span className="flex-grow">Term #{i+1}</span>

                    <button type="button" className="px-2">
                      <MdClear />
                    </button>
                  </div>
                  <div className="flex gap-2  text-center items-center text-sm py-0.5 px-1 bg-white bg-opacity-10">
                    <input
                      value={option.term}
                      className="bg-white bg-opacity-5 rounded px-2 w-10 text-right flex-grow py-1"
                    />
                    <span className="opacity-50 text-xs px-1">Months</span>
                  </div>
                  <div className="flex gap-2  text-center items-center text-sm py-0.5 px-1 bg-white bg-opacity-10 rounded-b">
                    <input
                      value={option.apr}
                      className="bg-white bg-opacity-5 rounded px-2 w-10 text-right flex-grow py-1"
                    />
                    <span className="opacity-50 text-xs px-1">% APR</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg flex print:flex-col w-full justify-between px-2 pt-1 pb-3 space-x-2 ">
            <Input
              name="downPayment"
              value={state.downPayment}
              onChange={handleChange}
              label="Downpayment"
              className="w-28 text-right"
            />
            <Input
              name="apr"
              value={state.apr}
              onChange={handleChange}
              label="APR"
              className="w-28 text-right"
            />
            <Input
              name="term"
              value={state.term}
              onChange={handleChange}
              label="Term In Months"
              className="w-28 text-right"
            />
          </div>

          <div className="rounded-lg bg-white bg-opacity-10 py-1 text-sm  my-2 flex  flex-col">
            <div className="w-full flex bg-white bg-opacity-0 hover:bg-opacity-10 transition-all">
              <div className="text-lg px-2 py-1 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg opacity-0">
                <MdCheckBox />
              </div>
              <span className="whitespace-nowrap px-2 flex-grow">
                Amount Financed
              </span>

              <span className="whitespace-nowrap px-2 w-32 text-right">
                {formatCurrency(amountFinanced)}{" "}
              </span>
              <div className="text-lg px-2 py-1 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg opacity-0">
                <MdEdit />
              </div>
            </div>
            <div className="w-full flex bg-white bg-opacity-0 hover:bg-opacity-10 transition-all">
              <div className="text-lg px-2 py-1 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg opacity-0">
                <MdCheckBox />
              </div>
              <span className="whitespace-nowrap px-2 flex-grow">
                Monthly Payment
              </span>

              <span className="whitespace-nowrap px-2 w-32 text-right">
                {formatCurrency(monthlyPayment)}{" "}
              </span>
              <div className="text-lg px-2 py-1 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg opacity-0">
                <MdEdit />
              </div>
            </div>
            <div className="w-full flex bg-white bg-opacity-0 hover:bg-opacity-10 transition-all">
              <div className="text-lg px-2 py-1 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg opacity-0">
                <MdCheckBox />
              </div>
              <span className="whitespace-nowrap px-2 flex-grow">
                Total Amount Paid
              </span>

              <span className="whitespace-nowrap px-2 w-32 text-right">
                {formatCurrency(totalAmountPaid)}{" "}
              </span>
              <div className="text-lg px-2 py-1 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg opacity-0">
                <MdEdit />
              </div>
            </div>
          </div>
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
          className="flex-grow flex justify-between w-full bg-white bg-opacity-0 hover:bg-opacity-20 transition-all rounded py-1 px-2 cursor-pointer select-none"
        >
          <span className=" w-full">{groupLabel}</span>
          <span className="">{formatCurrency(groupSum)}</span>
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
