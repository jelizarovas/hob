import React from "react";
import { MdCall } from "react-icons/md";

/**
 * Renders a final AgreementSheet with safe checks for missing props.
 * - If dealData or dealData.dealData is missing, it defaults to empty objects/arrays.
 * - Payment detail lines and Payment Matrix are shown only if data exist.
 */
export const AgreementSheet = ({
  dealership = {},
  manager = {},
  dealData = {}, // maybe an object containing { dealData: { ...fields }, items, paymentOptions, etc. }
  vehicle = {},
  ...props
}) => {
  // Safely unwrap nested data:
  const realDealData = dealData?.dealData || {};
  const items = dealData?.items || [];
  const paymentOptions = dealData?.paymentOptions || {};

  // Build arrays for buyer and coBuyer:
  const buyerData = [
    realDealData.customerPhone,
    realDealData.customerEmail,
    realDealData.customerAddress,
  ].filter(Boolean);

  const coBuyerData = [
    realDealData.coBuyerPhone,
    realDealData.coBuyerEmail,
    realDealData.coBuyerAddress,
  ].filter(Boolean);

  return (
    <div className="bg-white text-black min-h-screen flex flex-col md:p-10 font-sans">
      <div className="flex justify-evenly py-2 w-full">
        <div className="flex flex-col w-full md:w-1/2 p-2 leading-none">
          <strong className="text-sm leading-none">
            {realDealData.dealership?.legalName || ""}
          </strong>
          <span className="text-xs leading-none">
            {realDealData.dealership?.addressLine1 || ""}
          </span>
          <span className="text-xs leading-none">
            {realDealData.dealership?.addressLine2 || ""}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 justify-evenly w-full md:gap-10 md:w-1/2">
          <div className="flex flex-col">
            <strong className="whitespace-nowrap leading-none">Deal #</strong>
            <span className="leading-none">
              {realDealData.dealNumber || ""}
            </span>
          </div>
          {realDealData.customerNumber && (
            <div className="flex flex-col md:flex-grow">
              <strong className="whitespace-nowrap leading-none">
                Customer #
              </strong>
              <span className="leading-none">
                {realDealData.customerNumber}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <strong className="leading-none">
              {realDealData.selectedUser?.displayName || ""}
            </strong>
            <span className="leading-none">Contact Sales:</span>
          </div>
          <div className="relative">
            <button
              type="button"
              className="bg-slate-300 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-xs md:text-base hover:bg-slate-400 relative"
            >
              <span className="relative flex items-center">
                {realDealData.selectedUser?.displayName
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("") || ""}
              </span>
              <span className="bg-yellow-500 absolute -bottom-1 -right-1 rounded-full p-1 border-white border text-[8px] md:text-xs flex items-center justify-center w-4 h-4">
                <MdCall className="w-2 h-2 md:w-3 md:h-3" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-200 p-4 flex flex-col md:flex-row print:flex-row">
        <div className="md:w-1/2 print:w-3/5 px-2 flex flex-col justify-center">
          <div className="flex flex-col md:flex-row">
            {/* Buyer Column */}
            <div className="flex-1">
              <span className="font-arial font-bold whitespace-nowrap">
                {realDealData.customerFullName || ""}
              </span>
              <div className="flex flex-wrap">
                {buyerData.map((item, index) => (
                  <>
                    {index > 0 && <span className="px-2">|</span>}
                    <span>{item}</span>
                  </>
                ))}
              </div>
            </div>

            {/* Conditionally Render Co-Buyer Column if Data Exists */}
            {coBuyerData && coBuyerData.length > 0 && (
              <div className="flex-1">
                <span className="font-arial font-bold whitespace-nowrap">
                  {realDealData.coBuyerFullName || ""}
                </span>
                <div className="flex flex-wrap">
                  {coBuyerData && coBuyerData.map((item, index) => (
                    <>
                      {index > 0 && <span className="px-2">|</span>}
                      <span>{item}</span>
                    </>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col print:w-2/5 print:text-[10px]">
          <strong className="font-arial leading-none md:leading-normal text-lg print:text-sm">
            {`${vehicle?.year || ""} ${vehicle?.make || ""} ${
              vehicle?.model || ""
            }`}
          </strong>
          <span className="text-xs md:text-sm leading-none md:leading-normal">
            {vehicle?.trim || ""}
          </span>
          <span className="text-xs md:texr-base leading-none md:leading-normal">
            VIN : {vehicle?.vin || ""} | Stock # : {vehicle?.stock || ""}
          </span>
          <span className="text-xs md:text-sm leading-none md:leading-normal">
            Mileage : {vehicle?.miles ? `${vehicle.miles} mi` : ""}
          </span>
          <span className="text-xs md:text-sm leading-none md:leading-normal">
            Color : {vehicle?.ext_color ? vehicle.ext_color.toUpperCase() : ""}
          </span>
          <span className="text-xs md:text-sm leading-none md:leading-normal">
            {(vehicle?.make || "") + " |"} {vehicle?.doors || ""}
            {(vehicle?.trim || "") + " |"} {(vehicle?.drivetrain || "") + " |"}{" "}
            {(vehicle?.engine_description || "") + " |"}{" "}
            {(vehicle?.cylinders || "") + " |"}
            {(vehicle?.fueltype || "") + " |"} {(vehicle?.body || "") + " |"}{" "}
            {vehicle?.doors || ""}
          </span>
        </div>
      </div>

      <div className="flex-grow flex flex-col-reverse gap-2 md:gap-1 md:flex-row items-start py-4 print:flex-row">
        <PaymentMatrix paymentOptions={paymentOptions} />
        <div className="w-full md:w-2/5 bg-gray-200 p-1 md:p-2 print:w-2/5">
          <strong className="py-2">Payment Detail</strong>
          <ul className="text-sm">
            {items.map((item, i) => (
              <PaymentDetailLine
                key={i}
                label={item?.label}
                amount={item?.amount}
                isBold={item?.isBold}
              />
            ))}
          </ul>
        </div>
      </div>

      <div className="w-full flex items-center justify-evenly px-2">
        <div className="flex flex-col w-full px-4">
          <span className="text-2xl pt-10">X</span>
          <span className="text-xs border-t-2 p-1 whitespace-nowrap">
            Customer Signature & Date
          </span>
        </div>
        <div className="flex flex-col w-full px-4">
          <span className="text-2xl pt-10">X</span>
          <span className="text-xs border-t-2 p-1 whitespace-nowrap">
            Manager Signature & Date
          </span>
        </div>
      </div>
      <div className="text-xs md:text-sm opacity-80 flex flex-col mt-2 px-1">
        <span className="md:leading-normal leading-none text-justify">
          Understanding of NEGOTIATION: I agree to the above estimated terms and
          understand that all were and are negotiable, including interest rate
          of which dealer may receive/retain a portion, price, down payment,
          trade allowance, term, accessories, and value adds and that all are
          subject to execution of contract documents and financing approval. I
          understand actual credit terms may vary depending on my credit history
          and that I may be able to obtain financing on different terms from
          others.
        </span>
        <span className="md:leading-normal leading-none text-justify">
          *A negotiable dealer documentary service fee of up to $200 may be
          added to the sale price or capitalized cost.
        </span>
      </div>
      <DynamicDateTimeDiv />
    </div>
  );
};

// Helper Components

const DynamicDateTimeDiv = () => {
  const currentDate = new Date();
  const pacificTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(currentDate);

  const currentYear = currentDate.getFullYear();

  return (
    <div className="flex text-xs md:text-sm p-2 border-t border-gray-600 mt-2">
      <span className="flex-grow">© HofB App {currentYear}</span>
      <span className="opacity-70">{pacificTime}</span>
    </div>
  );
};

function PaymentMatrix({ paymentOptions = {} }) {
  // Fallbacks:
  const { terms = [], downPayments = [] } = paymentOptions;

  // 1) Filter only selected terms
  const selectedTerms = Array.isArray(terms)
    ? terms.filter((term) => term.selected)
    : [];

  // 2) Build the table headers from selected terms
  const termHeaders = selectedTerms.map((term) => ({
    payments: term.duration,
    apr: term.apr,
  }));

  // 3) Filter selected downPayments
  const selectedDownPayments = Array.isArray(downPayments)
    ? downPayments.filter((dp) => dp.selected)
    : [];

  // 4) Convert selectedDownPayments to display strings
  const downPaymentOptions = selectedDownPayments.map((dp) => {
    const numericAmount = parseFloat(dp.amount) || 0;
    return `$${numericAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  });

  // 5) Build a 2D array of payments
  const calculatedPayments = selectedDownPayments.map((dp) => {
    if (!dp.payments || !Array.isArray(dp.payments)) return [];
    // Filter payments by the same indexes
    return dp.payments
      .filter((_, index) => selectedTerms[index])
      .map((val) =>
        val
          ? `$${parseFloat(val).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "N/A"
      );
  });

  if (!termHeaders.length && !downPaymentOptions.length) {
    // No data to render
    return null;
  }

  return (
    <div className="w-full md:w-3/5 print:w-3/5">
      <table className="text-center">
        <thead>
          <tr>
            <th className="text-left">Finance</th>
            {termHeaders.map((header, index) => (
              <PaymentMatrixHeader
                key={index}
                text={`${header.payments} mo`}
                subtext={`${header.apr}% APR`}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {downPaymentOptions.map((downPayment, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-opacity-10 bg-black bg-opacity-0"
            >
              <PaymentMatrixDownpaymentOption
                text={downPayment}
                subtext="Customer Cash"
              />
              {calculatedPayments[rowIndex]?.map((payment, colIndex) => (
                <PaymentMatrixSelectOption key={colIndex} text={payment} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PaymentMatrixHeader = ({ text, subtext }) => {
  return (
    <td className="bg-gray-200 px-4 py-2 print:px-2 print:py-3 print:text-xs">
      <div className="flex flex-col items-center">
        <span className="font-bold">{text}</span>
        <span className="text-xs print:text-[10px] leading-none">
          {subtext}
        </span>
      </div>
    </td>
  );
};

const PaymentMatrixDownpaymentOption = ({ text, subtext }) => {
  return (
    <td className="border py-1 pr-4 print:pr-2 print:py-1">
      <div className="flex flex-col justify-center text-left p-1 leading-none text-sm print:text-xs">
        <strong>{text}</strong>
        <span>{subtext}</span>
      </div>
    </td>
  );
};

const PaymentMatrixSelectOption = ({ text }) => {
  if (typeof text === "object") {
    // Debugging
    console.warn("PaymentMatrixSelectOption received an object:", text);
    return <td className="border">Invalid payment</td>;
  }

  // If text is a string or number, we're good
  return (
    <td className="border bg-black bg-opacity-0 hover:bg-opacity-10 cursor-pointer px-2">
      <strong className="flex items-center justify-center h-16 text-sm print:text-xs">
        {typeof text === "number" ? text.toLocaleString() : text}
        /mo
      </strong>
    </td>
  );
};

const PaymentDetailLine = ({ label, amount, isBold }) => {
  // Safely format the amount
  let formattedAmount = "";
  if (amount && !isNaN(parseFloat(amount))) {
    const numericAmount = parseFloat(amount);
    formattedAmount = `$${numericAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } else {
    formattedAmount = amount || "";
  }

  return (
    <li
      className={`p-2 md:p-2 print:py-1 flex border-b-2 border-gray-300 hover:bg-black hover:bg-opacity-5 ${
        isBold ? "bg-black bg-opacity-10" : ""
      } cursor-pointer print:text-xs`}
    >
      <span className="flex-grow">{label || ""}</span>
      <span className={`${isBold ? "font-bold" : ""}`}>{formattedAmount}</span>
    </li>
  );
};
