import React from "react";
import { QuoteInput } from "./QuoteInput";

export const VehiclePriceCard = ({
  vehicle,
  handleChange,
  sellingPrice,
  discount,
  listedPrice,
}) => {
  return (
    <div className="bg-white bg-opacity-20 rounded-lg flex flex-col print:flex-col w-full justify-between px-2 pt-1 pb-3 space-x-2 ">
      <div className="flex">
        <div className="mr-2">
          <img src={vehicle?.thumbnail} className="w-16 h-10 rounded" />
        </div>
        <div className="flex flex-col  w-full px-1">
          <div className="flex justify-between items-center w-full">
            <a href={vehicle?.link} target="_blank" className="hover:underline">
              {vehicle?.year} {vehicle?.make} {vehicle?.model} {vehicle?.trim}
            </a>
            <span className="uppercase text-xs opacity-50">
              {vehicle?.type}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs opacity-50 px-2">{vehicle?.vin}</span>
            <span className="text-xs opacity-50 px-2">
              {vehicle?.miles} miles
            </span>
            <span className="text-xs opacity-50 px-2">
              {vehicle?.ext_color}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-between w-full">
        <QuoteInput
          name="listedPrice"
          value={listedPrice}
          onChange={handleChange}
          label="List / MSRP"
          className="w-28 text-right"
        />
        <QuoteInput
          name="discount"
          value={discount}
          onChange={handleChange}
          label="Discount"
          className="w-28 text-right"
        />
        <QuoteInput
          name="sellingPrice"
          value={sellingPrice}
          onChange={handleChange}
          label="Selling"
          className="w-28 text-right"
        />
      </div>
    </div>
  );
};
