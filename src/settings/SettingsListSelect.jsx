import React from "react";

export const SettingsListSelect = ({ label, data, currentData, onChange }) => {
  const [isOpen, setOpen] = React.useState(false);
  console.log({ data, currentData });
  return (
    <div>
      <label className="px-2" onClick={() => setOpen((v) => !v)}>
        {label}
      </label>
      {isOpen && (
        <ul className="text-xs leading-5 px-4">
          {data &&
            currentData &&
            Object.entries(currentData)
              .sort(sortFn)
              .map(([key, value], i) => (
                <li key={i}>
                  <span className="border rounded p-0.5">
                    {data?.[key] || 0} / {value}
                  </span>{" "}
                  {key.replace("<br/>", ", ")}
                </li>
              ))}
        </ul>
      )}
    </div>
  );
};

const sortFn = (a, b) => {
  if (a[1] < b[1]) {
    return 1; // Sort in descending order
  } else if (a[1] > b[1]) {
    return -1; // Sort in descending order
  }
  return 0;
};



//Accordeon Open > show reset button
//List item check mark toggle only selection
//List item label select only, or reset if only selected
//if selected more than one, show button to select all,
// ALT + underlined letter focus on list
// up/down arrows navigate
// space toggle on or off, enter select only
// hide additional options with button to expand
// add to url query