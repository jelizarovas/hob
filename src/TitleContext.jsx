// TitleContext.js
import React, { createContext, useState } from "react";
export const TitleContext = createContext();
export const TitleProvider = ({ children }) => {
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  return (
    <TitleContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </TitleContext.Provider>
  );
};
