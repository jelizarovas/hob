import React from "react";
import { LayoutAppBar } from "./LayoutAppbar";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <LayoutAppBar />
      <main className="container mx-auto px-2 py-1">{children}</main>
    </div>
  );
};

export default Layout;
