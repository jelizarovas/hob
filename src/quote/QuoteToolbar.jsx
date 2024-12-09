import React from "react";
import { MdPrint } from "react-icons/md";
import { Link } from "react-router-dom";

export const QuoteToolbar = ({
  resetQuote,
  toggleTradeIn,
  showTradeIn,
  handleNavigation,
  isLoading,
}) => {
  return (
    <div className="flex w-96 mx-auto space-x-2 print:hidden">
      <Link
        to="/"
        className="uppercase text-center flex justify-center items-center bg-white bg-opacity-10 hover:bg-opacity-25 text-xs py-1 rounded-lg w-96 mx-auto "
      >
        Back
      </Link>
      <button
        onClick={resetQuote}
        className="uppercase flex justify-center text-center px-2 gap-2 items-center bg-white bg-opacity-10 hover:bg-opacity-25 text-xs py-1 rounded-lg w-24 mx-auto"
      >
        <span>Reset</span>
      </button>
      <button
        onClick={toggleTradeIn}
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
        <MdPrint /> <span>Print</span>
      </button>
    </div>
  );
};
