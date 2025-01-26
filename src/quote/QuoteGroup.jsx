import NumberFlow from "@number-flow/react";
import React from "react";
import {
  MdAddCircleOutline,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDelete,
  MdIndeterminateCheckBox,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { QuoteInput } from "./QuoteInput";

export const QuoteGroup = ({
  data,
  groupName,
  groupLabel,
  groupSum,
  determineCheckboxState,
  handleAddField,
  toggleInclude,
  handleDeleteAddon,
  handleChange,
  dispatch,
}) => {
  const [isOpen, setOpen] = React.useState(true);
  const isChecked = determineCheckboxState(data);
  // console.log(Object.keys(data).length, { data });

  return (
    <div
      className={`flex flex-col  ${
        isChecked === "uncheck" || isChecked === "intermediate"
          ? Object.keys(data).length === 0
            ? "print:hidden"
            : ""
          : "print:hidden"
      }`}
    >
      <div className="flex items-center space-x-2 mt-2  bg-white bg-opacity-20 rounded-lg">
        <button
          onClick={() => {
            dispatch({
              type: "TOGGLE_ALL_INCLUDES",
              field: groupName,
              state: isChecked,
            });
          }}
          className="text-lg px-2 py-2 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg print:hidden"
        >
          {isChecked === "check" ? (
            <MdCheckBoxOutlineBlank />
          ) : isChecked === "intermediate" ? (
            <MdIndeterminateCheckBox />
          ) : (
            <MdCheckBox />
          )}
        </button>
        <div
          onClick={() => setOpen((v) => !v)}
          className="flex-grow flex justify-between items-center w-full bg-white bg-opacity-0 hover:bg-opacity-20 transition-all rounded py-1 px-2 cursor-pointer select-none"
        >
          <MdKeyboardArrowRight
            className={`mx-1 text-xl ${
              isOpen ? "rotate-90" : ""
            } transition-all`}
          />
          <span className=" w-full"> {groupLabel}</span>
          <span className="">
            <NumberFlow
              format={{
                style: "currency",
                currency: "USD",
                trailingZeroDisplay: "stripIfInteger",
              }}
              value={groupSum}
            />
          </span>
        </div>
        <div>
          <button
            onClick={handleAddField(groupName)}
            className="text-lg px-2 py-2 hover:bg-opacity-40 bg-white bg-opacity-0 transition-all rounded-lg print:hidden"
          >
            <MdAddCircleOutline />
          </button>
        </div>
      </div>
      <div className="mx-2 bg-white bg-opacity-10 rounded-b-lg ">
        {data &&
          isOpen &&
          Object.entries(data).map(([key, value], i) => (
            <div
              key={key}
              className={`flex space-x-2 px-2 my-1 items-center bg-white bg-opacity-0 hover:bg-opacity-5 ${
                value.include ? "" : "print:hidden"
              }  `}
            >
              <button
                className={`px-2 py-2 rounded-lg bg-white bg-opacity-0 transition-all hover:bg-opacity-20 print:hidden  `}
                onClick={() => {
                  toggleInclude(groupName, key);
                }}
              >
                {value.include ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
              </button>
              <QuoteInput
                name={`${groupName}.${key}.label`}
                value={data[key].label}
                onChange={handleChange}
                type="text"
                className=""
              />
              <QuoteInput
                className="w-1/4 text-right"
                name={`${groupName}.${key}.value`}
                value={data[key].value}
                onChange={handleChange}
              />
              <button
                className="px-2 py-2 rounded-lg bg-white bg-opacity-0 transition-all hover:bg-opacity-20   print:hidden"
                onClick={() => handleDeleteAddon(`${groupName}.${key}`)}
              >
                <MdDelete />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};
