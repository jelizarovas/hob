import React, { useState, useReducer, useEffect } from "react";
import cuid from "cuid";
import { MdCheckBox, MdEdit } from "react-icons/md";
import { determineCheckboxState, parsePrice } from "../utils";
import { Link, useHistory, useLocation } from "react-router-dom";
import PaymentMatrix from "../PaymentMatrix ";
import NumberFlow from "@number-flow/react";
import useLocalStorage from "../hooks/useLocalStorage";
import { initialQuote } from "./initialQuote";
import { QuoteToolbar } from "./QuoteToolbar";
import { VehiclePriceCard } from "./VehiclePriceCard";
import { QuoteInput } from "./QuoteInput";
import { QuoteGroup } from "./QuoteGroup";
import { quoteReducer } from "./reducer";

export const Quote = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showTradeIn, setShowTradeIn] = useState(false);
  let history = useHistory();
  const {
    search,
    state: { vehicle },
  } = useLocation();
  const [state, dispatch] = useLocalStorage(
    quoteReducer,
    initialQuote,
    vehicle
  );

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

  const handleNavigation = async () => {
    setIsLoading(true);
    try {
      const processedDealData = processQuote(state);
      history.push("/dev/pencil", { dealData: processedDealData, vehicle });
    } catch (error) {
      console.error("Error processing quote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [field, key, subfield] = name.split(".");

    if (key && subfield) {
      dispatch({ type: "SET_NESTED_FIELD", field, key, subfield, value });
    } else {
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

  const resetQuote = () =>
    dispatch({ type: "RESET_STATE", payload: initialQuote });

  const toggleTradeIn = () => setShowTradeIn((v) => !v);

  const [total, salesTax, sumPackages, sumAccessories, sumTradeIns, sumFees] =
    calculateTotal(state);

  // Use the state as needed
  return (
    <>
      <div className="container mx-auto py-2 flex space-y-2 flex-col  print:text-black">
        <QuoteToolbar
          resetQuote={resetQuote}
          toggleTradeIn={toggleTradeIn}
          showTradeIn={showTradeIn}
          isLoading={isLoading}
          handleNavigation={handleNavigation}
        />
        <div className=" w-96 mx-auto">
          <VehiclePriceCard
            vehicle={vehicle}
            handleChange={handleChange}
            sellingPrice={state.sellingPrice}
            discount={state.discount}
            listedPrice={state.listedPrice}
          />
          {showTradeIn && (
            <div className="bg-white items-center mt-2 bg-opacity-20 rounded-lg flex w-full justify-between px-2 pt-1 pb-3 space-x-2 ">
              <QuoteInput
                name="tradeInAllowance"
                value={state.tradeInAllowance}
                onChange={handleChange}
                label="Trade Allowance"
                className="w-28 text-right"
              />
              <QuoteInput
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
              <QuoteInput
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
