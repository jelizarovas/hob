import { useEffect, useRef } from "react";
//https://www.robinwieruch.de/react-hook-detect-click-outside-component/
export function useOutsideClick(callback) {
  const ref = useRef();

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [ref, callback]);

  return ref;
}
