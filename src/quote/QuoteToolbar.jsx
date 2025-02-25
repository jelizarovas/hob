import React from "react";
import { MdEdit, MdPrint, MdRestore, MdTraffic } from "react-icons/md";

export const QuoteToolbar = ({
  resetQuote,
  addTradeIn,
  handleNavigation,
  isLoading,
}) => {
  return (
    <div className="flex w-96 justify-center  mx-auto space-x-2 print:hidden  rounded">
      <ToolBarButton label="Reset" Icon={MdRestore} onClick={resetQuote} />
      <ToolBarButton
        label="Add Trade-In"
        Icon={MdTraffic}
        onClick={addTradeIn}
      />
      <ToolBarButton
        label={isLoading ? "Processing..." : "Pencil"}
        Icon={MdEdit}
        onClick={handleNavigation}
        disabled={isLoading}
      />
      <ToolBarButton
        label="Print"
        Icon={MdPrint}
        onClick={() => window.print()}
      />
    </div>
  );
};

const ToolBarButton = ({
  label,
  Icon,
  onClick = () => {},
  disabled = false,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className="flex space-x-1 items-center bg-white bg-opacity-10  px-2 py-1 transition-all  hover:bg-opacity-20 rounded cursor-pointer uppercase text-xs gap-1"
      disabled={disabled}
    >
      {Icon && <Icon className="text-lg" />}{" "}
      <span className="whitespace-nowrap opacity-80">{label}</span>
    </button>
  );
};
