import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const useFilters = () => {
  return useContext(FilterContext);
};

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({}); // Adjust initial state as needed

  return <FilterContext.Provider value={{ filters, setFilters }}>{children}</FilterContext.Provider>;
};
