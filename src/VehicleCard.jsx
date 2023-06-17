import React, { useState, useEffect, useRef } from "react";
import { MdKeyboardArrowDown, MdOutlineHistory } from "react-icons/md";
import { VINComponent } from "./VINdisplay";
import { Link } from "react-router-dom";

export const VehicleCard = ({ v, num, ...props }) => {
  // const [isOpen, setOpen] = React.useState(false);

  // const toggleOpen = () => setOpen((v) => !v);

  const backgroundStyle = {
    backgroundImage: `url(${v?.thumbnail})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <Link
      to={{
        pathname: `/${v?.stock}`,
        state: v,
      }}
      // onClick={toggleOpen}
      className="w-full  md:w-72 max-w-full flex flex-col   border border-white hover:bg-white hover:bg-opacity-20 transition-all border-opacity-20 md:rounded "
    >
      <div
        className="w-full h-72 md:h-48  rounded-t flex-shrink-0 overflow-hidden"
        style={backgroundStyle}
      >
        {/* <img className="w-full h-auto" src={v?.thumbnail} /> */}
      </div>
      <div className="flex flex-col justify-between items-start flex-grow truncate">
        <span
          className="whitespace-pre-wrap text-sm "
          // href={v?.link}
          // target="_blank"
        >
          {`${v?.year} ${v?.make} ${v?.model}`}{" "}
          <span className="opacity-40">{v?.trim}</span>
        </span>
        <div className="flex justify-between text-xs w-full ">
          <div className="text-sm ">{v?.vin && "#" + v.vin.slice(-8)}</div>
          <div className="text-xs">{v?.miles && parseMileage(v.miles)}</div>
          {/* <img alt="New 2023 Platinum White Pearl Honda Sport image 1" class="swiper-lazy swiper-lazy-loaded loaded" src="https://vehicle-images.dealerinspire.com/7537-18003632/19XFL2H84PE014539/fbc77f331f6d98d619e8671628fc4521.jpg"></img> */}
        </div>
      </div>
    </Link>
  );
};

function parseMileage(mileage) {
  return (
    Math.floor(Number(mileage.toString().replace(/\D/g, "")) / 1000) + "k miles"
  );
}

/*
https://vehicle-images.dealerinspire.com/5c72-110004555/5FPYK3F83PB038255/2725a01ae213a95dc7245b7c99548490.jpg
https://vehicle-images.dealerinspire.com/d398-110004555/5FPYK3F83PB038255/ecaf9157cb9c4b96da06dc36733c6cc5.jpg


https://vehicle-images.dealerinspire.com/5c72-110004555/thumbnails/large/5FPYK3F83PB038255/2725a01ae213a95dc7245b7c99548490.jpg
*/
