import React from "react";
import {
  MdAddCircle,
  MdDataArray,
  MdEdit,
  MdPrint,
  MdRestore,
  MdTraffic,
} from "react-icons/md";

export const QuoteToolbar = ({
  resetQuote,
  addTradeIn,
  handleNavigation,
  isLoading,
  openDealModal,
}) => {
  return (
    <div className="flex w-96 justify-center  mx-auto space-x-2 print:hidden  rounded">
      <ToolBarButton label="Reset" Icon={MdRestore} onClick={resetQuote} />
      <ToolBarButton label="Trade-In" Icon={MdAddCircle} onClick={addTradeIn} />
      <ToolBarButton label="Deal" Icon={MdDataArray} onClick={openDealModal} />
      <ToolBarButton
        label={isLoading ? "Processing..." : "Pencil"}
        Icon={MdEdit}
        onClick={handleNavigation}
        disabled={isLoading}
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
