import React from "react";
import { MdCheck, MdClear, MdSearch } from "react-icons/md";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { usePopper } from "react-popper";
import { isMobile } from "react-device-detect";
import { Kbd } from "./Kbd";
import { Label } from "./Label";

export const DropDown = ({
  options = [],
  renderItem = () => {},
  renderButton = () => {},
  RenderListContainer = ListContainer,
  containerClassName = "",
  defaultValue = null,
  value,
  onChange = () => {},
  onSelect = () => {},
  label = "",
  disableSearch = false,
  Icon = null,
  searchKey,
  popperPlacement = "bottom-start",
}) => {
  const buttonRef = React.useRef(null);
  const [isOpen, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(defaultValue);
  const [error, setError] = React.useState(null);
  const [isLoading, setLoading] = React.useState(false);
  let [arrowElement, setArrowElement] = React.useState(null);

  let [popperElement, setPopperElement] = React.useState();
  let [referenceElement, setReferenceElement] = React.useState();
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: popperPlacement,
    modifiers: [
      { name: "arrow", options: { element: arrowElement, padding: 5 } },
    ],
    // modifiers: [
    //   {
    //     name: "offset",
    //     options: {
    //       offset: [0, 20],
    //     },
    //   },
    // ],
  });
  let isContainerAbove =
    attributes?.popper?.["data-popper-placement"] === "top";
  const containerRef = useOutsideClick(() => {
    const skipFocus = true;
    if (isOpen) close(skipFocus);
  });

  const close = React.useCallback(
    (skipFocus = false) => {
      setOpen(false);
      if (!skipFocus && buttonRef?.current) buttonRef.current?.focus();
    },
    [buttonRef]
  );

  const open = React.useCallback(() => {
    setOpen(true);
  }, []);

  const handleKeyDown = (e) => {
    const { key } = e;
    if (key === "Tab" && isOpen) {
      e.preventDefault();
      close();
    }

    if (key.match(/^[a-z]$/i) && !isOpen) {
      open();
    }

    if (key === "Enter") {
      e.preventDefault();
      if (!isOpen) open();
    }
  };

  React.useEffect(() => {
    if (value) setSelected(value);
  }, [value]);

  // const loadData = async () => {
  //   try {
  //     setTimeout(async () => {
  //       setLoading(false);
  //       open();
  //     }, 2000);
  //   } catch (err) {
  //     setError(err);
  //   }

  //   return;
  // };

  // const retryLoadData = async () => {
  //   setError(null);
  //   setLoading(true);
  //   await loadData();
  // };

  return (
    <div ref={containerRef} className="max-w-lg w-full h-full    ">
      {label && <Label label={label} />}
      <div ref={setReferenceElement} className="relative h-full w-full   ">
        {renderButton &&
          renderButton({
            value,
            buttonRef,
            isOpen,
            close,
            open,
            selected,
            handleKeyDown,
            label,
            Icon,
            isLoading,
            error,
            onSelect,
            onChange,
            // retryLoadData,
          })}
        {isOpen && (
          <div
            ref={setPopperElement}
            style={{
              flexDirection: isContainerAbove ? "column-reverse" : "column",

              ...styles.popper,
            }}
            {...attributes.popper}
            className={`flex absolute left-0   bg-black shadow-lg rounded z-50 min-w-fit max-w-full text-white ${containerClassName}`}
          >
            <RenderListContainer
              {...{
                isContainerAbove,
                disableSearch,
                setSelected,
                onSelect,
                onChange,
                close,
                label,
                options,
                selected,
                renderItem,
                searchKey,
                value,
              }}
            />
            <div
              ref={setArrowElement}
              style={styles.arrow}
              {...attributes.arrow}
              className="absolute w-0 h-0 border-l-4 border-r-4 border-b-4 
             border-l-transparent border-r-transparent border-b-zinc-800 shadow-inner 
             -mt-1"
            />
          </div>
        )}
      </div>
      {error && (
        <div className="text-red-500 text-xs h-4 px-2">{error?.message}</div>
      )}
    </div>
  );
};

const ListContainer = ({
  isContainerAbove,
  disableSearch,
  setSelected,
  onSelect,
  onChange,
  close,
  label,
  options,
  selected,
  renderItem,
  searchKey = "displayName",
}) => {
  const [searchValue, setSearchValue] = React.useState("");

  const resultContainer = React.useRef(null);
  const [results, setResults] = React.useState(options);
  const [focusedIndex, setFocusedIndex] = React.useState(
    results.findIndex((r) => selected?.id === r?.id) || 0
  );

  const handleChange = (e) => {
    setSearchValue(e.target.value);
    onChange && onChange(e);
  };

  const handleSelection = (selectedIndex) => {
    const selectedItem = results[selectedIndex];
    if (!selectedItem) return close();
    setSelected(selectedItem);
    setSearchValue("");
    onSelect && onSelect(selectedItem);
    close();
  };

  React.useEffect(() => {
    if (options && options.length > 0)
      setResults(
        options.filter((item) =>
          Object.values(item)
            .join(" ")
            .toLowerCase()
            .includes(searchValue?.toLowerCase())
        )
      );
    return () => {};
  }, [options, searchValue]);

  React.useEffect(() => {
    if (!resultContainer.current) return;
    resultContainer.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    if (disableSearch) resultContainer.current.focus();
  }, [focusedIndex, disableSearch]);

  const handleKeyDown = (e) => {
    e.stopPropagation();
    const { key } = e;
    let nextIndexCount = 0;

    const down = (focusedIndex + 1) % results.length;
    const up = (focusedIndex + results.length - 1) % results.length;

    if (key === "ArrowDown") {
      e.preventDefault();
      nextIndexCount = !isContainerAbove ? down : up;
    }

    if (key === "ArrowUp") {
      e.preventDefault();
      nextIndexCount = !isContainerAbove ? up : down;
    }

    if (key === "Escape") close();

    if (key === "Backspace" && searchValue === "") close();
    if (key === "Tab") {
      e.preventDefault();
      close();
    }

    if (e.ctrlKey && key === "x" && !disableSearch) {
      e.target?.select();
    }

    if (key === "Enter") {
      e.preventDefault();
      handleSelection(focusedIndex);
    }

    if (key.match(/^[a-z]$/i) && disableSearch) {
      const i = results.findIndex(
        (r) =>
          r?.[searchKey] &&
          r[searchKey]?.toLowerCase()?.startsWith(key.toLowerCase())
      );
      nextIndexCount = i >= 0 ? i : 0;
    }

    setFocusedIndex(nextIndexCount);
  };

  return (
    <>
      {!disableSearch && (
        <div className="flex  items-center space-x-2 border-b px-3 py-1 bg-slate-50 ring-inset focus-within:ring-1">
          <MdSearch />
          <input
            type="search"
            value={searchValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            // onInput={console.log}
            onBlur={() => {
              if (isMobile) close(true);
            }}
            onSubmit={(e) => console.log(e)}
            className="w-full bg-transparent px-2 py-1 text-sm  outline-none transition"
            placeholder={`Search for ${label ? label : ""}...`}
            autoFocus={!isMobile}
          />
          {!!searchValue && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSearchValue("");
              }}
              className="text-sm px-2"
            >
              <MdClear />
            </button>
          )}
        </div>
      )}

      <ul
        className="flex flex-col w-full outline rounded overflow-y-auto min-w-fit bg-transparent select-none outline-none " //removed max-h-56
        style={{
          flexDirection: isContainerAbove ? "column-reverse" : "column",
        }}
      >
        {results && results.length > 0 ? (
          results.map((item, index) => {
            return (
              <li
                tabIndex={disableSearch ? 1 : -1}
                key={index}
                onClick={() => handleSelection(index)}
                onKeyDown={handleKeyDown}
                ref={index === focusedIndex ? resultContainer : null}
                style={{
                  backgroundColor:
                    index === focusedIndex ? "rgba(30,58,138,0.1)" : "",
                  fontWeight: item === selected ? "bold" : "",
                }}
                className="cursor-pointer  hover:bg-blue-100 hover:bg-opacity-50  flex items-center bg-transparent justify-between whitespace-nowrap "
              >
                {item?.Component ? <item.Component /> : renderItem(item)}
                {item === selected && <MdCheck className="mx-2" />}
              </li>
            );
          })
        ) : (
          <li
            className="flex flex-col text-center py-2 hover:bg-opacity-5 bg-black bg-opacity-0 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setSearchValue("");
            }}
          >
            <span className="text-sm py-2">
              Nothing found for "{searchValue}"
            </span>
            {!isMobile && (
              <span className="text-[8px]  text-gray-400">
                <Kbd label="ctrl" /> + <Kbd label="x" /> to clear the search
              </span>
            )}
          </li>
        )}
      </ul>
    </>
  );
};
