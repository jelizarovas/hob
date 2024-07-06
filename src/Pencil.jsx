import React from "react";
import { MdCall } from "react-icons/md";

const dealershipData = {
  legalName: "HOFB Inc. dba Honda of Burien",
  addressLine1: "15206 1st Ave S.",
  addressLine2: "Burien, King, WA 98148",
};

const managerData = {
  fullName: "Joshua Wallace",
  cell: "206-591-9143",
};

const dealData = {
  id: "59122",
  items: [
    { label: "Retail Price", amount: "$51,500.00" },
    { label: "Your Price", amount: "$51,500.00" },
    { label: "All Weather Mats", amount: "$330.00" },
    { label: "Estimated License Fees", amount: "$899.00" },
    { label: "Documentary Service Fee*", amount: "$200.00" },

    { label: "Sales Subtotal", amount: "$52,128.00" },
    { label: "Amount Financed", amount: "$52,128.00", isBold: true },
  ],
};

export const Pencil = ({
  dealership = dealershipData,
  deal = dealData,
  vehicle,
  customer,
  manager = managerData,
}) => {
  return (
    <div className="bg-white text-black h-screen flex flex-col md:p-10">
      <div className="flex  justify-evenly  py-2 w-full">
        <div className="flex flex-col w-full md:w-1/2  p-2 leading-none">
          <strong className="leading-none">{dealership?.legalName}</strong>
          <span className="text-sm leading-none">
            {dealership?.addressLine1}
          </span>
          <span className="text-sm leading-none">
            {dealership?.addressLine2}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 justify-evenly  w-full md:gap-10  md:w-1/2 ">
          <div className="flex flex-col">
            <strong className="whitespace-nowrap leading-none">Deal #</strong>{" "}
            <span className="leading-none">{deal?.id}</span>
          </div>
          <div className="flex flex-col md:flex-grow">
            <strong className="whitespace-nowrap leading-none">
              Customer #
            </strong>{" "}
            <span></span>
          </div>
          <div className="flex flex-col">
            <strong className="leading-none">{manager?.fullName}</strong>
            <span className="leading-none">Contact Sales:</span>
          </div>
          <div className="relative">
            <button
              type="button"
              className="bg-slate-300 rounded-full p-1 md:p-2 relative text-xs md:text-base hover:bg-slate-400"
            >
              {manager?.fullName.split(" ").map((word, index) => word[0])}
              <span className="bg-yellow-500 absolute -left-2 -bottom-2 rounded-full p-1 border-white border text-[8px] md:text-xs">
                <MdCall />
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="bg-gray-200 p-4 flex flex-col md:flex-row">
        <div className="md:w-1/2"></div>
        <div className="md:w-1/2 flex flex-col">
          <strong className="leading-none md:leading-normal text-lg ">
            2024 Honda Pilot
          </strong>
          <span className="text-xs md:text-sm leading-none md:leading-normal ">
            Elite
          </span>
          <span className="text-xs md:texr-base leading-none md:leading-normal">
            VIN : 5FNYG1H89RB044611 | Stock # : RB044611
          </span>
          <span className="text-xs md:text-sm leading-none md:leading-normal">
            Mileage : 5 mi{" "}
          </span>
          <span className="text-xs md:text-sm leading-none md:leading-normal">
            {" "}
            Color : PLATINUM WHITE PEARL{" "}
          </span>
          <span className="text-xs md:text-sm leading-none md:leading-normal">
            honda | Elite | 4ELITE | AWD | Naturally Aspirated | 3.5L V6DOHC 24V
            | 3.5L | 6 | Gasoline | Utility | SUV | 4
          </span>
        </div>
      </div>

      <div className="flex-grow flex flex-col-reverse gap-2 md:gap-0 md:flex-row items-start py-4 ">
        <div className="w-full md:w-3/5">
          <table className="text-center w-full ">
            <tr className="">
              <td></td>
              <PaymentMatrixHeader text="48 mos" subtext="4.9% APR" />
              <PaymentMatrixHeader text="60 mos" subtext="5.9% APR" />
              <PaymentMatrixHeader text="72 mos" subtext="5.9% APR" />
            </tr>
            <tr className="hover:bg-opacity-10 bg-black bg-opacity-0">
              <PaymentMatrixDownpaymentOption
                text="$0.00"
                subtext="Customer Cash"
              />
              <PaymentMatrixSelectOption text="$1,094.33" />
              <PaymentMatrixSelectOption text="$960.48" />
              <PaymentMatrixSelectOption text="$882.00" />
            </tr>
            <tr className="hover:bg-opacity-10 bg-black bg-opacity-0">
              <PaymentMatrixDownpaymentOption
                text="$500.00"
                subtext="Customer Cash"
              />
              <PaymentMatrixSelectOption text="$1,094.33" />
              <PaymentMatrixSelectOption text="$960.48" />
              <PaymentMatrixSelectOption text="$882.00" />
            </tr>
            <tr className="hover:bg-opacity-10 bg-black bg-opacity-0">
              <PaymentMatrixDownpaymentOption
                text="$1000.00"
                subtext="Customer Cash"
              />
              <PaymentMatrixSelectOption text="$1,094.33" />
              <PaymentMatrixSelectOption text="$960.48" />
              <PaymentMatrixSelectOption text="$882.00" />
            </tr>
          </table>
        </div>
        <div className="w-full md:w-2/5 bg-gray-200 p-1 md:p-2">
          <strong className="py-2">Payment Detail</strong>
          <ul className="text-sm">
            {[
              { label: "Retail Price", amount: "$51,500.00" },
              { label: "Your Price", amount: "$51,500.00" },
              { label: "All Weather Mats", amount: "$330.00" },
              { label: "Estimated License Fees", amount: "$899.00" },
              { label: "Documentary Service Fee*", amount: "$200.00" },

              { label: "Sales Subtotal", amount: "$52,128.00" },
              { label: "Amount Financed", amount: "$52,128.00", isBold: true },
            ].map((item, i) => (
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
          <span className="text-2xl pt-10">×</span>
          <span className="text-xs border-t-2 p-1 whitespace-nowrap">
            Customer Signature & Date
          </span>
        </div>
        <div className="flex flex-col w-full px-4">
          <span className="text-2xl pt-10">×</span>
          <span className="text-xs border-t-2  p-1 whitespace-nowrap">
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
          subject to execution of contract documents and fi nancing approval. I
          understand actual credit terms may vary depending on my credit history
          and that I may be able to obtain fi nancing on diff erent terms from
          others.
        </span>
        <span className="md:leading-normal leading-none text-justify">
          *A negotiable dealer documentary service fee of up to $200 may be
          added to the sale price or capitalized cost.
        </span>
      </div>
      <div className="flex text-xs md:text-sm p-2 border-t-2 border-gray-600 mt-2">
        <span className="flex-grow">© Tekion Corp 2024</span>
        <span className="opacity-70">Tue May 7 2024 | 4:28 PM</span>
      </div>
    </div>
  );
};

const PaymentDetailLine = ({ label, amount, isBold, ...props }) => {
  return (
    <li
      className={`p-2 md:p-2 flex border-b-2 border-gray-300 hover:bg-black hover:bg-opacity-5 ${
        isBold ? "bg-black bg-opacity-10" : "bg-opacity-0"
      } cursor-pointer`}
    >
      <span className="flex-grow">{label}</span>
      <span className={`${isBold ? "font-bold " : ""}`}>{amount}</span>
    </li>
  );
};

const PaymentMatrixHeader = ({ text, subtext, ...props }) => {
  return (
    <td className="bg-gray-200 px-4 py-2">
      <div className="flex flex-col items-center">
        <span className="font-bold">{text}</span>
        <span className="text-xs leading-none">{subtext}</span>{" "}
      </div>
    </td>
  );
};

const PaymentMatrixDownpaymentOption = ({ text, subtext, ...props }) => {
  return (
    <td className="border py-1 px-4">
      <div className="flex flex-col justify-center text-left p-1 leading-none text-sm">
        <strong>{text}</strong>
        <span>{subtext}</span>
      </div>
    </td>
  );
};

const PaymentMatrixSelectOption = ({ text, subtext, ...props }) => {
  return (
    <td className="border bg-black bg-opacity-0 hover:bg-opacity-10 cursor-pointer">
      <strong className=" flex items-center justify-center h-16 text-sm">
        {text}
      </strong>
    </td>
  );
};
