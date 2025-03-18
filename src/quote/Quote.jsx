import React, { useState, useReducer, useEffect } from "react";
import cuid from "cuid";
import { MdCheckBox, MdEdit } from "react-icons/md";
import { determineCheckboxState, parsePrice } from "../utils";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import PaymentMatrix from "../PaymentMatrix ";
import NumberFlow from "@number-flow/react";
import useLocalStorage from "../hooks/useLocalStorage";
import { initialQuote } from "./initialQuote";
import { QuoteToolbar } from "./QuoteToolbar";
import { VehiclePriceCard } from "./VehiclePriceCard";
import { QuoteInput } from "./QuoteInput";
import { QuoteGroup } from "./QuoteGroup";
import { quoteReducer } from "./reducer";
import { firstPaymentDate, useQuoteCalculations } from "./useQuoteCalculations";
import PaymentDelayModal from "./PaymentDelayModal";
import TradeInList from "./TradedInList";
import DealDataModal from "./DealDataModal";
import { useAuth } from "../auth/AuthProvider";

export const Quote = () => {
  const [isLoading, setIsLoading] = useState(false);
  let history = useHistory();
  const { vin } = useParams();
  const { state: locationState } = useLocation();
  const vehicle = locationState?.vehicle;

  const { currentUser, profile } = useAuth();

  const defaultUser = {
    displayName: currentUser?.displayName || "Arnas Jelizarovas",
    cell: profile?.cell || "206-591-9143",
  };

  const msrpValue = vehicle ? parsePrice(vehicle.msrp) : null;
  const ourPriceValue = vehicle ? parsePrice(vehicle.our_price) : null;

  const computedInitialQuote = vehicle
    ? {
        ...initialQuote,
        listedPrice: msrpValue > 0 ? msrpValue : ourPriceValue,
        sellingPrice: ourPriceValue,
        discount: msrpValue > 0 ? msrpValue - ourPriceValue : 0,
        dealData: {
          ...initialQuote.dealData, // ensure initialQuote.dealData exists or default to {}
          selectedUser: defaultUser,
        },
      }
    : {
        ...initialQuote,
        dealData: {
          ...initialQuote.dealData,
          selectedUser: defaultUser,
        },
      };

  const [state, dispatch] = useLocalStorage(
    quoteReducer,
    {
      paymentMatrix: { terms: [], downPayments: [] },
      ...computedInitialQuote,
    },
    vin
  );

  const [showDelayModal, setShowDelayModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);

  const closeDelayModal = () => setShowDelayModal(false);
  const openDelayModal = () => setShowDelayModal(true);

  const closeDealModal = () => setShowDealModal(false);
  const openDealModal = () => setShowDealModal(true);

  const handleDelayConfirm = (newDelay, customDate) => {
    dispatch({
      type: "SET_FIELD",
      field: "daysToFirstPayment",
      value: newDelay.toString(),
    });
    closeDelayModal();
  };

  const handleDealConfirm = (newDealData) => {
    dispatch({ type: "SET_FIELDS", payload: { dealData: newDealData } });
    closeDealModal();
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

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseFloat(value) || 0;

    // Get the current state values
    let listPrice = parseFloat(state.listedPrice) || 0;
    let sellingPrice = parseFloat(state.sellingPrice) || 0;

    if (name === "listedPrice") {
      // When listPrice changes, keep discount unchanged.
      // Update sellingPrice = new listPrice - current discount.
      listPrice = newValue;
      const currentDiscount = parseFloat(state.discount) || 0;
      sellingPrice = newValue - currentDiscount;
    } else if (name === "sellingPrice") {
      // When sellingPrice changes, listPrice remains unchanged.
      sellingPrice = newValue;
    } else if (name === "discount") {
      // When discount changes, update sellingPrice so that:
      // discount = listPrice - sellingPrice => sellingPrice = listPrice - discount.
      sellingPrice = listPrice - newValue;
    }

    dispatch({
      type: "UPDATE_PRICES",
      payload: { listPrice, sellingPrice },
    });
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

  const resetQuote = () => dispatch({ type: "RESET_STATE", payload: computedInitialQuote });

  const { total, salesTax, sumPackages, sumAccessories, sumTradeIns, sumFees, paymentMatrix } =
    useQuoteCalculations(state);

  const handleNavigation = async () => {
    setIsLoading(true);
    try {
      const quoteData = {
        ...state, // raw user inputs
        total,
        salesTax,
        sumPackages,
        sumAccessories,
        sumTradeIns,
        sumFees,
        paymentMatrix,
      };
      const processedDealData = processQuote(quoteData);
      history.push("/pencil/66452", {
        dealData: processedDealData,
        vehicle,
      });
    } catch (error) {
      console.error("Error processing quote:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const addTradeIn = () => {
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

  // Use the state as needed
  return (
    <>
      <div className="container mx-auto py-2 flex space-y-2 flex-col  print:text-black">
        <QuoteToolbar
          resetQuote={resetQuote}
          addTradeIn={addTradeIn}
          isLoading={isLoading}
          handleNavigation={handleNavigation}
          openDealModal={openDealModal}
        />
        <div className=" w-96 mx-auto">
          <VehiclePriceCard
            vehicle={vehicle}
            handleChange={handlePriceChange}
            sellingPrice={state.sellingPrice}
            discount={state.discount}
            listedPrice={state.listedPrice}
          />
          <TradeInList tradeIns={state.tradeIns} dispatch={dispatch} />

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

          <PaymentMatrix paymentMatrix={paymentMatrix} dispatch={dispatch} />
          <div className="text-xs py-2 opacity-60 text-center leading-none">
            Payments are based on {state.daysToFirstPayment} day start date (
            {firstPaymentDate(state.daysToFirstPayment).toLocaleDateString()}).
            <button type="button" className="hover:underline px-2" onClick={openDelayModal}>
              Edit
            </button>
          </div>
          {showDelayModal && (
            <PaymentDelayModal
              initialDelay={state.daysToFirstPayment}
              onConfirm={handleDelayConfirm}
              onCancel={closeDelayModal}
            />
          )}
          {showDealModal && (
            <DealDataModal
              initialDealData={state?.dealData}
              onConfirm={handleDealConfirm}
              onCancel={closeDealModal}
              users={[defaultUser]}
            />
          )}
        </div>
      </div>
    </>
  );
};

function processQuote(quote) {
  const listedPrice = parseFloat(quote.listedPrice) || 0;
  const discount = parseFloat(quote.discount) || 0;
  const sellingPrice = parseFloat(quote.sellingPrice) || 0;

  const includedPackages = Object.values(quote.packages)
    .filter((pkg) => pkg.include)
    .map((pkg) => ({
      label: pkg.label,
      amount: `${Number(pkg?.value).toFixed(2)}`,
    }));

  const includedAccessories = Object.values(quote.accessories)
    .filter((acc) => acc.include)
    .map((acc) => ({
      label: acc.label,
      amount: `${Number(acc?.value).toFixed(2)}`,
    }));

  const includedFees = Object.values(quote.fees)
    .filter((fee) => fee.include)
    .map((fee) => ({
      label: fee.label,
      amount: `${Number(fee?.value).toFixed(2)}`,
    }));

  // Process trade-ins from state.tradeIns
  // Process trade-ins from state.tradeIns
  const tradeInsArray = Object.values(quote.tradeIns || {}).sort((a, b) => a.createdAt - b.createdAt);
  const includedTradeIns = tradeInsArray.filter((trade) => trade.include);

  // Determine if we need to append a plus sign to the labels.
  const appendPlus = includedTradeIns.length > 1;

  const processedTradeIns = includedTradeIns
    .map((trade, index) => {
      const allowance = parseFloat(trade.allowance) || 0;
      // Subtract payoff only if status is "Financed" or "Leased"
      const payoff = trade.status === "Financed" || trade.status === "Leased" ? parseFloat(trade.payoffAmount) || 0 : 0;
      const plusSuffix = appendPlus ? " +" : "";
      return [
        {
          label: `Trade In #${index + 1} Allowance${plusSuffix}`,
          amount: allowance.toFixed(2),
        },
        {
          label: `Trade In #${index + 1} Payoff${plusSuffix}`,
          amount: payoff.toFixed(2),
        },
      ];
    })
    .flat();

  const tradeIns = Object.values(quote.tradeIns || {})
    .sort((a, b) => a.createdAt - b.createdAt)
    .filter((trade) => trade.include);

  // Construct the final dealData object
  const dealItems = [
    { label: "Retail Price", amount: `${listedPrice.toFixed(2)}` },
    ...(discount > 0
      ? [{ label: "Savings", amount: `${discount.toFixed(2)}` }]
      : discount < 0
      ? [{ label: "Market Adjustment", amount: `${Math.abs(discount).toFixed(2)}` }]
      : []),
    { label: "Your Price", amount: `${sellingPrice.toFixed(2)}` },
    ...includedPackages,
    ...includedAccessories,
    ...processedTradeIns, // include trade-in items here
    ...includedFees,
    ...(quote?.salesTaxRate > 0 ? [{ label: `Taxes (${quote.salesTaxRate}%)`, amount: `${quote.salesTax}` }] : []),
    { label: "Sales Subtotal", amount: `${quote.total}`, isBold: false },
    // { label: "Customer Cash", amount: `${quote.paymentMatrix}` },
    // {
    //   label: "Amount Financed",
    //   amount: `${amountFinanced.toFixed(2)}`,
    //   isBold: true,
    // },
  ];

  return {
    id: quote?.dealData?.dealNumber || "N/A",
    dealData: quote?.dealData,
    items: dealItems,
    paymentOptions: quote.paymentMatrix,
    tradeIns,
  };
}
