import React from "react";
import { MdCall } from "react-icons/md";

export const Pencil = () => {
  return (
    <div className="bg-white text-black h-screen flex flex-col p-10">
      <div className="flex justify-evenly w-full ">
        <div className="flex flex-col w-1/2  p-2">
          <strong>HOFB Inc. dba Honda of Burien</strong>
          <span className="text-sm">15206 1st Ave S. </span>
          <span className="text-sm"> Burien, King, WA 98148</span>
        </div>
        <div className="flex gap-10  w-1/2 ">
          <div className="flex flex-col">
            <strong>Deal #</strong> <span>59122</span>
          </div>
          <div className="flex flex-col flex-grow">
            <strong>Customer #</strong> <span></span>
          </div>
          <div className="flex flex-col">
            <strong>Joshua Wallace</strong> <span>Contact Sales:</span>
          </div>
          <div className="relative">
            <div className="bg-slate-300 rounded-full p-2 relative">
              JW
              <span className="bg-yellow-500 absolute -left-2 -bottom-2 rounded-full p-1 border-white border text-xs">
                <MdCall />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-200 p-4 flex">
        <div className="w-1/2"></div>
        <div className="w-1/2 flex flex-col">
          <strong className="leading-none text-lg">2024 Honda Pilot</strong>
          <span className="text-sm">Elite</span>
          <span>VIN : 5FNYG1H89RB044611 | Stock # : RB044611</span>
          <span className="text-sm">Mileage : 5 mi </span>
          <span className="text-sm"> Color : PLATINUM WHITE PEARL </span>
          <span className="text-sm">
            honda | Elite | 4ELITE | AWD | Naturally Aspirated | 3.5L V6DOHC 24V
            | 3.5L | 6 | Gasoline | Utility | SUV | 4
          </span>
        </div>
      </div>

      <div className="flex-grow flex items-start py-4 ">
        <div className="w-3/5">
          <div className="w-96 flex">
            <div className="w-1/2"></div>
            <strong className="w-1/2 bg-gray-200 flex items-center justify-center h-16 text-sm">
              Cash
            </strong>
          </div>
          <div className="w-96 flex">
            <div className="w-1/2 border flex flex-col justify-center p-1 leading-none text-sm">
              <strong>$0.00</strong>
              <span>Customer Cash</span>
            </div>
            <strong className="w-1/2 border flex items-center justify-center h-16 text-sm">
              $52,128.00
            </strong>
          </div>
        </div>
        <div className="w-2/5 bg-gray-200 p-2">
          <strong className="py-2">Payment Detail</strong>
          <ul className="text-sm">
            <li className="p-2 flex border-b-2 border-gray-300">
              <span className="flex-grow">Retail Price</span>
              <span>$51,500.00</span>
            </li>
            <li className="p-2 flex border-b-2 border-gray-300">
              <span className="flex-grow">Your Price</span>
              <span>$51,500.00</span>
            </li>
            <li className="p-2 flex border-b-2 border-gray-300">
              <span className="flex-grow">All Weather Mats</span>
              <span>$330.00</span>
            </li>
            <li className="p-2 flex border-b-2 border-gray-300">
              <span className="flex-grow">Estimated License Fees</span>
              <span>$95.00</span>
            </li>
            <li className="p-2 flex border-b-2 border-gray-300">
              <span className="flex-grow">Documentary Service Fee*</span>
              <span>$200.00</span>
            </li>
            <li className="p-2 flex border-b-2 border-gray-300">
              <span className="flex-grow">Sales Subtotal</span>
              <span>$52,128.00</span>
            </li>
            <li className="p-2 flex border-b-2 border-gray-300 bg-black bg-opacity-20">
              <span className="flex-grow">Amount Financed</span>
              <strong>$52,128.00</strong>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex">
        <div className="w-1/2 flex flex-col">
          <span className="text-2xl pt-10">×</span>
          <span className="text-xs border-t-2 w-3/5 p-1">
            Customer Signature & Date
          </span>
        </div>
        <div className="w-1/2 flex flex-col">
          <span className="text-2xl pt-10">×</span>
          <span className="text-xs border-t-2 w-4/5 p-1">
            Joshua Wallace | Manager Signature & Date
          </span>
        </div>
      </div>
      <div className="text-sm opacity-80 flex flex-col mt-2">
        <span>
          Understanding of NEGOTIATION: I agree to the above estimated terms and
          understand that all were and are negotiable, including interest rate
          of which dealer may receive/retain a portion, price, down payment,
          trade allowance, term, accessories, and value adds and that all are
          subject to execution of contract documents and fi nancing approval. I
          understand actual credit terms may vary depending on my credit history
          and that I may be able to obtain fi nancing on diff erent terms from
          others.
        </span>
        <span>
          *A negotiable dealer documentary service fee of up to $200 may be
          added to the sale price or capitalized cost.
        </span>
      </div>
      <div className="flex text-sm p-2 border-t-2 border-gray-600 mt-2">
        <span className="flex-grow">© Tekion Corp 2024</span>
        <span className="opacity-70">Tue May 7 2024 | 4:28 PM</span>
      </div>
    </div>
  );
};
