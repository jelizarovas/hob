import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { MenuButton } from "./MenuButton";
import { TitleContext } from "./TitleContext";

export const LayoutAppBar = ({ dropdownOptions }) => {
  const { breadcrumbs } = useContext(TitleContext);

  // Remove HOFB if it appears as the first breadcrumb
  let filteredCrumbs = breadcrumbs;
  if (breadcrumbs.length && breadcrumbs[0][0] === "HOFB") {
    filteredCrumbs = breadcrumbs.slice(1);
  }

  // Apply truncation logic
  let displayCrumbs = filteredCrumbs;
  if (filteredCrumbs.length > 3) {
    displayCrumbs = [
      filteredCrumbs[0],
      ["...", "#"],
      filteredCrumbs[filteredCrumbs.length - 1],
    ];
  }

  return (
    <div className="text-white w-screen">
      <div className="container flex items-center  bg-black p-2 mx-auto max-w-full">
        <div className="flex-grow">
          <LogoLink />
          {displayCrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <span className="px-2 opacity-25">/</span>
              {crumb[1] !== "#" ? (
                <Link
                  className="hover:text-blue-100 transition-all hover:underline"
                  to={crumb[1]}
                >
                  {crumb[0]}
                </Link>
              ) : (
                <span>{crumb[0]}</span>
              )}
              {/* {index < displayCrumbs.length - 1 && <span> / </span>} */}
            </React.Fragment>
          ))}
        </div>
        <MenuButton />
      </div>
    </div>
  );
};

const LogoLink = () => {
  return (
    <>
      <Link
        to="/"
        className="text-blue-500 hover:text-blue-300 hover:underline transition-all font-bold  pl-2"
      >
        HOFB
      </Link>
    </>
  );
};
