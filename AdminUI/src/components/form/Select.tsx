import { useEffect, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  value?: string;  // Changed from defaultValue to value for controlled component
  error?: boolean;  // Added for error styling/handling
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  value = "",  // Default to empty string if not provided
  error = false,
}) => {
  // Manage the selected value (controlled by parent via value prop)
  const [selectedValue, setSelectedValue] = useState<string>(value);

  // Sync with parent value if it changes (for controlled behavior)
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedValue(newValue);
    onChange(newValue); // Trigger parent handler
  };

  // Dynamic class for error state
  const errorClass = error ? "border-red-300 focus:border-red-300 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/10";

  return (
    <select
      className={`h-11 w-full appearance-none rounded-lg bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${errorClass} ${
        selectedValue
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={selectedValue}
      onChange={handleChange}
      aria-invalid={error}
    >
      {/* Placeholder option */}
      <option
        value=""
        disabled
        className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {placeholder}
      </option>
      {/* Map over options */}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;