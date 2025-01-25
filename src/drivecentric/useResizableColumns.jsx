import { useState, useEffect } from "react";

const useResizableColumns = (initialWidths, initialHeights) => {
  const [colWidths, setColWidths] = useState(initialWidths);
  const [colHeights, setColHeights] = useState(initialHeights);

  // Load saved widths and heights from localStorage
  useEffect(() => {
    const savedWidths = JSON.parse(localStorage.getItem("crmColumnWidths"));
    const savedHeights = JSON.parse(localStorage.getItem("crmColumnHeights"));
    if (savedWidths) setColWidths(savedWidths);
    if (savedHeights) setColHeights(savedHeights);
  }, []);

  // Save widths and heights to localStorage
  const saveWidths = (newWidths) => {
    localStorage.setItem("crmColumnWidths", JSON.stringify(newWidths));
  };

  const saveHeights = (newHeights) => {
    localStorage.setItem("crmColumnHeights", JSON.stringify(newHeights));
  };

  // Update column width
  const handleResizeWidth = (colKey, newWidth) => {
    const updatedWidths = { ...colWidths, [colKey]: newWidth };
    setColWidths(updatedWidths);
    saveWidths(updatedWidths);
  };

  // Update column height
  const handleResizeHeight = (colKey, newHeight) => {
    const updatedHeights = { ...colHeights, [colKey]: newHeight };
    setColHeights(updatedHeights);
    saveHeights(updatedHeights);
  };

  return {
    colWidths,
    colHeights,
    handleResizeWidth,
    handleResizeHeight,
  };
};

export default useResizableColumns;
