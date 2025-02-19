import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { MenuButton } from "./MenuButton";
import { TitleContext } from "./TitleContext";

export const LayoutAppBar = () => {
  const { breadcrumbs } = useContext(TitleContext);
  const [expanded, setExpanded] = useState(false);

  // 1. Filter out "HOFB" if it’s the first crumb to avoid duplication with the logo link.
  let filteredCrumbs = breadcrumbs;
  if (filteredCrumbs.length && filteredCrumbs[0][0] === "HOFB") {
    filteredCrumbs = filteredCrumbs.slice(1);
  }

  // 2. Truncate overly long labels (e.g. user IDs).
  const truncateLabel = (label, maxLength = 10) => {
    if (!label) return "";
    return label.length <= maxLength
      ? label
      : label.slice(0, maxLength - 3) + "...";
  };

  // 3. If not expanded and more than 3 crumbs, collapse the middle into [...]
  let displayCrumbs;
  if (!expanded && filteredCrumbs.length > 3) {
    displayCrumbs = [
      filteredCrumbs[0],
      ["...", "#"], // '#' triggers expansion on click
      filteredCrumbs[filteredCrumbs.length - 1],
    ];
  } else {
    displayCrumbs = filteredCrumbs;
  }

  return (
    <div className="text-white w-screen">
      <div className="container flex flex-wrap items-center bg-black p-2 mx-auto max-w-full">
        {/* Left side: Logo + Breadcrumbs */}
        <div className="flex flex-wrap items-center flex-grow">
          <LogoLink />
          {displayCrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <span className="px-2 opacity-25">/</span>
              {crumb[1] !== "#" ? (
                <Link
                  to={crumb[1]}
                  className="hover:text-blue-100 hover:underline transition-all break-words"
                >
                  {truncateLabel(crumb[0])}
                </Link>
              ) : (
                <span
                  onClick={() => setExpanded(true)}
                  className="cursor-pointer hover:text-blue-100 hover:underline transition-all break-words"
                >
                  {truncateLabel(crumb[0])}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Right side: Menu button */}
        <MenuButton />
      </div>
    </div>
  );
};

const LogoLink = () => (
  <Link
    to="/"
    className="text-blue-500 hover:text-blue-300 hover:underline transition-all font-bold pl-2"
  >
    HOFB
  </Link>
);
