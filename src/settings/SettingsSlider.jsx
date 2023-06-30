import React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

function valuetext(value) {
  return `${value}`;
}

// const marks = [
//   {
//     value: 2000,
//     label: "2000",
//   },

//   {
//     value: 2023,
//     label: "2023",
//   },
// ];

function generateMarks(minValue, maxValue) {
  const marks = [];

  marks.push({ value: minValue, label: minValue.toString() });
  marks.push({ value: maxValue, label: maxValue.toString() });

  return marks;
}

// const generateMarks = (minValue, maxValue) => {
//   return [
//     {
//       value: minValue,
//       label: `${minValue}`,
//     },

//     {
//       value: maxValue,
//       label: `${maxValue}`,
//     },
//   ];
// };

export const SettingsSlider = ({
  value,
  onChange,
  minValue = 1999,
  maxValue = 2023,
  label = "Setting",
}) => {
  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  const handleMinValueInput = (e) =>
    onChange([Number(e.target.value), value[1]]);
  const handleMaxValueInput = (e) =>
    onChange([value[0], Number(e.target.value)]);

  const marks = generateMarks(minValue, maxValue);

  return (
    <div className="py-0  text-xs">
      <div className="flex justify-between px-2">
        <div>
          <label>{label}</label>{" "}
          <input
            type="number"
            className="bg-transparent w-12 text-center"
            value={value[0] || minValue}
            onChange={handleMinValueInput}
          />{" "}
          <span className="px-2">-</span>
          <input
            type="number"
            className="bg-transparent w-12 text-center"
            value={value[1] || maxValue}
            onChange={handleMaxValueInput}
          />
        </div>
      </div>
      <div className="px-6">
        <Slider
          getAriaLabel={() => `${label} range`}
          value={value || [minValue, maxValue]}
          min={minValue}
          step={1}
          max={maxValue}
          onChange={handleChange}
          valueLabelDisplay="auto"
          getAriaValueText={valuetext}
          marks={marks}
        />
      </div>
    </div>
  );
};
