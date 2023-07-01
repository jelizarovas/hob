import React from "react";

export const SettingsListSelect = ({ label, data, onChange }) => {
  const [isOpen, setOpen] = React.useState(false);

  return (
    <div>
      <label
        className="
      px-2"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </label>
      {isOpen && (
        <ul className="text-xs leading-5 px-4">
          {Object.entries(data)
            .sort(sortFn)
            .map(([key, value], i) => (
              <li key={i}>
                <span className="border rounded p-0.5">{value}</span>{" "}
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
