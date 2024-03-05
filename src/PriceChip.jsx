import { MdClear, MdFilterAlt } from "react-icons/md";
import { useVehicles } from "./VehicleContext";

export const PriceChip = () => {
  const { filters, updateFilters, defaultFacetsStats } = useVehicles();

  const handleRemovePriceFilter = () => {
    updateFilters({ price: [null, null] }); // Reset to null to indicate no filter
  };

  // Function to format numbers without decimals
  const formatNumber = (number) =>
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0, // Avoid showing decimal places
    }).format(number);

  // Check for applied price filter conditions
  const isMinPriceApplied = filters.price[0] !== null && filters.price[0] > defaultFacetsStats?.["our_price"]?.["min"];
  const isMaxPriceApplied = filters.price[1] !== null && filters.price[1] < defaultFacetsStats?.["our_price"]?.["max"];
  const isPriceFilterApplied = isMinPriceApplied || isMaxPriceApplied;

  let priceDisplay;

  if (isMinPriceApplied && isMaxPriceApplied) {
    // Both Min and Max prices are applied
    priceDisplay = `Price $${formatNumber(filters.price[0])} - $${formatNumber(filters.price[1])}`;
  } else if (isMinPriceApplied) {
    // Only Min price is applied
    priceDisplay = `Price Min $${formatNumber(filters.price[0])}`;
  } else if (isMaxPriceApplied) {
    // Only Max price is applied
    priceDisplay = `Price Max $${formatNumber(filters.price[1])}`;
  }

  if (!isPriceFilterApplied) {
    return null; // Don't render anything if no price filter is applied
  }

  return (
    <div className="bg-white select-none bg-opacity-10 text-xs py-1 mb-1 px-2 rounded-full flex items-center hover:bg-opacity-20 transition-all">
      <div className="flex items-center space-x-2"><MdFilterAlt /> <span>{priceDisplay}</span></div>
      <button
        onClick={handleRemovePriceFilter}
        className="border-l px-1 ml-1 border-white border-opacity-5 hover:text-lg hover:px-0.5 hover:leading-none transition-all"
      >
        <MdClear />
      </button>
    </div>
  );
};
