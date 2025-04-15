import React from "react";
import { LayoutAppBar } from "./LayoutAppBar";
import { TitleProvider } from "./TitleContext";
import { MenuBar } from "./components/MenuBar";

const Layout = ({ children }) => {
  return (
    <TitleProvider>
      <div className="relative flex flex-col min-h-screen">
        <LayoutAppBar />
        {/* <MenuBar /> */}
        <main className="container flex-grow  bg-red-500  mx-auto md:px-2 md:py-1">{children}</main>
      </div>
    </TitleProvider>
  );
};

export default Layout;
