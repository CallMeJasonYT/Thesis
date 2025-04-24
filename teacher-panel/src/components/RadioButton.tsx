import React from "react";
import { useRadioGroup } from "./RadioGroup";
import "./styles/RadioGroup.css";

type RadioButtonProps = {
  value: string;
  label: string;
};

export const RadioButton: React.FC<RadioButtonProps> = ({ value, label }) => {
  const { selectedValue, onChange } = useRadioGroup();

  return (
    <label className="radio-label">
      <input
        type="radio"
        className="radio-input"
        value={value}
        checked={selectedValue === value}
        onChange={() => onChange(value)}
      />
      {label}
    </label>
  );
};
