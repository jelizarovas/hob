import React from "react";
import { LayoutAppBar } from "./LayoutAppBar";
import { TitleProvider } from "./TitleContext";
import { MenuBar } from "./components/MenuBar";

const Layout = ({ children }) => {
  return (
    <TitleProvider>
      <div className="relative layout">
        <LayoutAppBar />
        {/* <MenuBar /> */}
        <main className="container mx-auto px-2 py-1">{children}</main>
      </div>
    </TitleProvider>
  );
};

export default Layout;
