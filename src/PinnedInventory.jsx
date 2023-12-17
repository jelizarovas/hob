import React from "react";

export const PinnedInventory = ({
  pinnedCars,
  setPinnedCars,
  addPinnedCar,
  removePinnedCar,
  clearPinnedCars,
  togglePinnedCar,
}) => {
  return (
    <div>
      <h2>Pinned Cars</h2>

      {pinnedCars && <pre>{JSON.stringify(pinnedCars, null, 2)}</pre>}
    </div>
  );
};
