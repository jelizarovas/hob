import React from "react";
import { LayoutAppBar } from "./LayoutAppBar";
import { TitleProvider } from "./TitleContext";
import { MenuBar } from "./components/MenuBar";

const Layout = ({ children }) => {
  return (
    <TitleProvider>
      <div className=" flex flex-col h-screen">
        <LayoutAppBar />
        {/* <main className="flex flex-col flex-1 overflow-y-scroll">
        </main> */}
          {children}
      </div>
    </TitleProvider>
  );
};

export default Layout;
