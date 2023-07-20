import React from "react";
import { MdArrowCircleLeft, MdFilterList } from "react-icons/md";
import { Link } from "react-router-dom";
import { FilterListSelection } from "./FilterListSelection";

export const DevPanel = () => {
  return (
    <div>
      <Link
        to="/"
        type="button"
        className="border rounded-full p-1 text-2xl mr-3 ml-1 bg-white border-opacity-20 opacity-80 border-white bg-opacity-0 hover:bg-opacity-20 transition-all"
      >
        <MdArrowCircleLeft />
      </Link>
      <div className="container mx-auto p-10 border border-white rounded-3xl">
        <FilterListSelection />
        <FilterListSelection />
        <FilterListSelection />
        <FilterListSelection />
      </div>
    </div>
  );
};
