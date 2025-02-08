import React from "react";
import { Link } from "react-router-dom";
import { MenuButton } from "./MenuButton";

export const LayoutAppBar = ({ dropdownOptions }) => {
  return (
    <div className="">
      <div className="container flex items-center justify-between bg-black p-2 mx-auto">
        <LogoLink />

        <MenuButton />
      </div>
    </div>
  );
};


const LogoLink = () => {
    return (
      <>
        <style>{`
          .logo-shine {
            display: inline-block;
            font-size: 1rem;
            font-weight: bold;
            background: linear-gradient(90deg, #007bff, #ffffff, #007bff);
            background-size: 200% auto;
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
          }
          .logo-shine:hover {
            animation: shineText 5s linear infinite;
          }
          @keyframes shineText {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
        `}</style>
        <Link to="/" className="logo-shine flex-grow px-2">
          HOFB
        </Link>
      </>
    );
  };

