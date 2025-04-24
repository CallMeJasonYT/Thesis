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
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children: ReactNode;
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  defaultValue = "",
  onChange,
  children,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
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
