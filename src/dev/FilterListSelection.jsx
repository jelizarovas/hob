import React from "react";
import {
  MdFilterAlt,
  MdKeyboardArrowRight,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineFilterAlt,
  MdOutlineFilterAltOff,
  MdOutlineSortByAlpha,
  MdSort,
} from "react-icons/md";

const labelx = "Make";

const datax = {
  Acura: 2,
  Audi: 3,
  BMW: 9,
  Cadillac: 3,
  Chevrolet: 11,
  Chrysler: 2,
  Dodge: 2,
  Ford: 11,
  GMC: 1,
  Honda: 38,
  Hyundai: 1,
  Jeep: 10,
  Kia: 6,
  "Land Rover": 1,
  Lexus: 2,
  Mazda: 2,
  "Mercedes-Benz": 4,
  Mitsubishi: 1,
  Nissan: 10,
  Ram: 1,
  Scion: 1,
  Subaru: 8,
  Tesla: 2,
  Toyota: 13,
  Volkswagen: 4,
};
const currentDatax = {
  Acura: 2,
  Audi: 3,
  BMW: 9,
  Cadillac: 3,
  Chevrolet: 11,
  Chrysler: 2,
  Dodge: 2,
  Ford: 11,
  GMC: 1,
  Honda: 38,
  Hyundai: 1,
  Jeep: 10,
  Kia: 6,
  "Land Rover": 1,
  Lexus: 2,
  Mazda: 2,
  "Mercedes-Benz": 4,
  Mitsubishi: 1,
  Nissan: 10,
  Ram: 1,
  Scion: 1,
  Subaru: 8,
  Tesla: 2,
  Toyota: 13,
  Volkswagen: 4,
};

export const FilterListSelection = ({
  label = labelx,
  data = datax,
  currentData = currentDatax,
  openByDefault = false,
  showAllByDefault = false,
  sortByAlphabetByDefault = true,
  onChange,
}) => {
  const [isOpen, setOpen] = React.useState(openByDefault);
  const [showAll, setShowAll] = React.useState(showAllByDefault);
  const [sortBy, setSortBy] = React.useState(sortByAlphabetByDefault); //true - alphabetically, false - by count
  const [selected, setSelected] = React.useState(
    setAllValuesToTrue(currentData)
  );

  React.useEffect(() => {
    onChange &&
      onChange(Object.keys(selected).filter((key) => selected[key] === true));
    return () => {};
  }, [selected]);

  const isFiltered = !areAllValuesTrue(selected);

  const toggleSort = (e) => setSortBy((v) => !v);

  const toggleSelect = (e) => {
    setSelected((obj) => {
      const updatedObj = { ...obj };
      updatedObj[e.target.name] = !updatedObj[e.target.name];
      // if (!areAllValuesTrue(updatedObj)) {
      //   return setAllValuesToTrue(updatedObj);
      // }
      return updatedObj;
    });
  };

  const reset = () => setSelected(setAllValuesToTrue);

  const dataArray = Object.entries(currentData);
  return (
    <div className="w-full max-w-md">
      {!isOpen ? (
        <button
          className=" w-full px-2 flex items-center justify-between active:ring-2 select-none hover:bg-white rounded hover:bg-opacity-10 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center space-x-1">
            <MdFilterAlt className={isFiltered ? "" : "opacity-0"} />
            <label className="uppercase text-xs p-1"> {label}</label>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-2 -mx-2">
              <MdKeyboardArrowRight />
            </div>
          </div>
        </button>
      ) : (
        <>
          <div
            onClick={() => setOpen(false)}
            className=" w-full  flex items-center justify-between active:ring-2 select-none hover:bg-white rounded hover:bg-opacity-10 cursor-pointer"
          >
            <div className="flex items-center space-x-1 px-2">
              <TitleButton
                Icon={MdOutlineFilterAltOff}
                onClick={reset}
                disabled={!isFiltered}
              />
              <label className="uppercase text-xs p-1"> {label}</label>
            </div>
            <div className="flex items-center space-x-4">
              <TitleButton
                Icon={sortBy ? MdOutlineSortByAlpha : MdSort}
                onClick={toggleSort}
              />
              <TitleButton
                Icon={MdKeyboardArrowUp}
                onClick={() => setOpen(false)}
              />
            </div>
          </div>
          <ul className="text-xs leading-2 px-4">
            {data &&
              dataArray
                .sort(sortBy ? sortByName : sortByCount)
                .slice(0, showAll ? dataArray.length : 5)
                .map(([key, value], i) => (
                  <li
                    key={i}
                    className="relative space-x-2 flex items-center justify-between hover:bg-gradient-to-r rounded hover:from-[rgba(100,100,100,30)]  hover:to-transparent active:bg-white active:bg-opacity-40 cursor-pointer group/li"
                  >
                    <label className="space-x-2 flex items-center flex-grow cursor-pointer select-none">
                      <Checkbox
                        name={key}
                        value={selected[key]}
                        tabIndex={i}
                        onChange={
                          isFiltered
                            ? toggleSelect
                            : (e) =>
                                setSelected(selectOnlyOne(key, currentData))
                        }
                      />
                      <span className={selected[key] ? "" : "opacity-20"}>
                        {" "}
                        {key.replace("<br/>", ", ")}
                      </span>
                    </label>
                    <button
                      tabIndex={i + dataArray.length - 1}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelected(selectOnlyOne(key, currentData));
                      }}
                      className={`${
                        selected[key] ? "" : "opacity-20"
                      } w-8 select-none  group/span relative flex justify-center px-2 hover:-m-2 hover:p-2 hover:z-10 rounded-full hover:bg-[rgba(100,100,100,0.3)] active:bg-[rgba(100,100,100,0.7)] transition-all`}
                    >
                      {currentData?.[key] || 0}
                    </button>
                  </li>
                ))}
            {dataArray.length >= 5 && (
              <button
                className="w-full flex justify-center hover:bg-white hover:bg-opacity-5 py-1 rounded transition-all"
                onClick={() => setShowAll((v) => !v)}
              >
                <MdKeyboardDoubleArrowUp
                  className={`transition-all ${
                    showAll ? "rotate-0" : "rotate-180"
                  }`}
                />
              </button>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

const Checkbox = ({ name, value, onChange }) => {
  return (
    <input
      type="checkbox"
      className="ml-1 my-0.5 mr-2 accent-slate-400 cursor-pointer"
      name={name}
      checked={value}
      value={value}
      onChange={onChange}
    />
  );
};

const TitleButton = ({
  Icon,
  onClick,
  className = "",
  disabled = false,
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick && onClick(e);
      }}
      disabled={disabled}
      className={`p-2 -m-2 hover:p-2 hover:-m-2 hover:opacity-100 opacity-40 disabled:opacity-0 hover:bg-white hover:bg-opacity-20 active:bg-opacity-50 focus:ring-2  rounded-full  transition-all ${className}`}
    >
      <Icon className="    " />
    </button>
  );
};

const sortByCount = (a, b) => {
  if (a[1] < b[1]) {
    return 1; // Sort in descending order
  } else if (a[1] > b[1]) {
    return -1; // Sort in descending order
  }
  return 0;
};

const sortByName = (a, b) => {
  if (a[0] < b[0]) {
    return -1; // Sort in descending order
  } else if (a[0] > b[0]) {
    return 1; // Sort in descending order
  }
  return 0;
};

const setAllValuesToTrue = (obj) => {
  const updateObj = { ...obj };
  for (const key in updateObj) {
    updateObj[key] = true;
  }
  return updateObj;
};
const selectOnlyOne = (onlyKey, obj) => {
  console.log(onlyKey);
  const updateObj = { ...obj };
  for (const key in updateObj) {
    if (onlyKey != key) {
      updateObj[key] = false;
    } else {
      updateObj[key] = true;
    }
  }
  return updateObj;
};

function areAllValuesTrue(obj) {
  return Object.values(obj).every((value) => value === true);
}

const handleKeyDown = (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const currentElement = e.target;
    const nextSibling = currentElement.nextElementSibling;
    if (nextSibling) {
      nextSibling.focus();
    } else {
      // If there's no next sibling, focus on the first input (loop to the beginning)
      const firstInput = document.querySelector("input");
      if (firstInput) {
        firstInput.focus();
      }
    }
  }
};

//bg-gradient-to-r from-slate-50 via-violet-600 to-indigo-600

//Accordeon Open > show reset button
//List item check mark toggle only selection
//List item label select only, or reset if only selected
//if selected more than one, show button to select all,
// ALT + underlined letter focus on list
// up/down arrows navigate
// space toggle on or off, enter select only
// hide additional options with button to expand
// add to url query
//on first click user expects just to ONLY select that one, and continue as regular
//pass how many should be hidden, just show 80%
//need tooltips
