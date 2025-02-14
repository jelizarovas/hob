import React from "react";
import { LayoutAppBar } from "./LayoutAppBar";
import { TitleProvider } from "./TitleContext";

const Layout = ({ children }) => {
  return (
    <TitleProvider>
      <div className="layout">
        <LayoutAppBar />
        <main className="container mx-auto px-2 py-1">{children}</main>
      </div>
    </TitleProvider>
  );
};

export default Layout;
