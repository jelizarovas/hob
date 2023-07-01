import React from "react";
import Slider from "@mui/material/Slider";

function valuetext(value) {
  return `${value}`;
}

function generateMarks(...args) {
  return args
    .filter((n) => n)
    .sort()
    .map((arg) => ({
      value: arg,
      label: (
        <span className="text-xs border border-white border-opacity-25 rounded p-0.5 bg-black">
          {arg.toString()}
        </span>
      ),
    }));
}

export const SettingsSlider = ({
  value,
  onChange,
  minValue = 1999,
  maxValue = 2023,
  currentMinValue,
  currentMaxValue,
  label = "Setting",
}) => {
  const [tempValue, setTempValue] = React.useState(value);

  React.useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleChangeComplete = (event, newValue) => {
    onChange(newValue);
  };
  const handleChange = (event, newValue) => {
    setTempValue(newValue);
  };

  const handleMinValueInput = (e) =>
    onChange([Number(e.target.value), value[1]]);
  const handleMaxValueInput = (e) =>
    onChange([value[0], Number(e.target.value)]);
  const handleValueInput = (e) => onChange(Number(e.target.value));

  const marks = generateMarks(
    minValue,
    currentMinValue,
    currentMaxValue,
    maxValue
  );

  return (
    <div className="py-0  text-xs">
      <div className="flex justify-between px-2">
        <div>
          <label>{label}</label>{" "}
          {Array.isArray(value) ? (
            <>
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
            </>
          ) : (
            <input
              type="number"
              className="bg-transparent w-12 text-center"
              value={value}
              onChange={handleValueInput}
            />
          )}
        </div>
      </div>
      <div className="px-6">
        <Slider
          getAriaLabel={() => `${label} range`}
          value={
            !!tempValue && Array.isArray(tempValue)
              ? tempValue?.[0] !== null && tempValue?.[1] !== null
                ? tempValue
                : [minValue, maxValue]
              : tempValue
          }
          // value={!!tempValue}
          min={minValue}
          step={1}
          max={maxValue}
          onChange={handleChange}
          onChangeCommitted={handleChangeComplete}
          valueLabelDisplay="auto"
          getAriaValueText={valuetext}
          marks={marks}
        />
      </div>
    </div>
  );
};
