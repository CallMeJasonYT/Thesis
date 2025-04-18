import React, { createContext, useContext, useState, ReactNode } from "react";
import "./styles/RadioGroup.css";

type RadioGroupContextType = {
  selectedValue: string;
  onChange: (value: string) => void;
};

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(
  undefined
);

type RadioGroupProps = {
  name: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: ReactNode;
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  defaultValue = "",
  onChange,
  children,
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  const handleChange = (value: string) => {
    setSelectedValue(value);
    onChange?.(value);
  };

  return (
    <RadioGroupContext.Provider
      value={{ selectedValue, onChange: handleChange }}
    >
      <div role="radiogroup" aria-labelledby={name}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

export const useRadioGroup = () => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error("useRadioGroup must be used within a RadioGroup");
  }
  return context;
};
