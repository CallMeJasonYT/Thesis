"use client";

import { useState, useEffect } from "react";
import { RadioGroup } from "./RadioGroup";
import { RadioButton } from "./RadioButton";
import { CircleQuestionIcon, FiltersIcon } from "@/icons";
import { useSharedData } from "@/contexts/SharedDataContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FilterSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { formattedStages, statAttributes, setFilters, filters, isLoading } =
    useSharedData();

  // Local state for form values
  const [selectedLevel, setSelectedLevel] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedFilter, setSelectedFilter] = useState("");
  const [attributeInputs, setAttributeInputs] = useState<{
    [key: string]: number;
  }>({});
  const [stageInputs, setStageInputs] = useState<{ [key: string]: number }>({});

  // Initialize local state when context data is loaded
  useEffect(() => {
    if (!isLoading && filters) {
      // Update local state from context
      setSelectedLevel(filters.selectedLevel);
      setStartDate(filters.startDate);
      setEndDate(filters.endDate);
      setSelectedFilter(filters.selectedFilter);
      setAttributeInputs(filters.attributeInputs);
      setStageInputs(filters.stageInputs);
    }
  }, [isLoading, filters]);

  // Update stage inputs when selected level changes
  useEffect(() => {
    if (selectedLevel && formattedStages[selectedLevel]) {
      const newStageInputs: Record<string, number> = {};
      formattedStages[selectedLevel].forEach((stage) => {
        // Preserve existing values or set to 100% if new
        newStageInputs[stage] = stageInputs[stage] ?? 100;
      });
      setStageInputs(newStageInputs);
    }
  }, [selectedLevel, formattedStages]);

  const handleApplyFiltersButton = () => {
    // Apply the filters once when the user hits Apply
    setFilters({
      selectedLevel,
      startDate,
      endDate,
      selectedFilter,
      attributeInputs,
      stageInputs,
    });
  };

  // Return loading state or placeholder if data isn't ready
  if (isLoading) {
    return (
      <div className="relative mt-2 mb-2">
        <button
          disabled
          className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded-lg font-bold cursor-not-allowed"
        >
          <FiltersIcon className="size-5" />
          Loading Filters...
        </button>
      </div>
    );
  }

  // No data loaded yet
  if (!statAttributes.length || Object.keys(formattedStages).length === 0) {
    return (
      <div className="relative mt-2 mb-2">
        <button
          disabled
          className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1 rounded-lg font-bold cursor-not-allowed"
        >
          <FiltersIcon className="size-5" />
          No Filter Data Available
        </button>
      </div>
    );
  }

  const renderStatSliders = () =>
    statAttributes.map((stat) => (
      <div
        key={stat.attribute_name}
        className="flex flex-col items-start gap-1 w-full"
      >
        <label className="text-sm">
          {stat.attribute_name}: {attributeInputs[stat.attribute_name] ?? 100}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={attributeInputs[stat.attribute_name] ?? 100}
          onChange={(e) =>
            setAttributeInputs((prev) => ({
              ...prev,
              [stat.attribute_name]: parseInt(e.target.value, 10),
            }))
          }
          className="w-full accent-primary"
        />
      </div>
    ));

  const renderStageSliders = () =>
    formattedStages[selectedLevel]?.map((stage) => (
      <div key={stage} className="flex flex-col items-start gap-1 w-full">
        <label className="text-sm">
          {stage}: {stageInputs[stage] ?? 100}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={stageInputs[stage] ?? 100}
          onChange={(e) =>
            setStageInputs((prev) => ({
              ...prev,
              [stage]: parseInt(e.target.value, 10),
            }))
          }
          className="w-full accent-primary"
        />
      </div>
    ));

  return (
    <div className="relative mt-2 mb-2">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-lg font-bold hover:bg-tertiary transition"
      >
        <FiltersIcon className="size-5" />
        {isOpen ? "Hide Filters" : "Filters"}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out transform origin-top ${
          isOpen
            ? "scale-y-100 opacity-100 p-8 max-h-[2000px]"
            : "scale-y-0 opacity-0 max-h-0 p-0"
        } bg-muted rounded-lg mt-2 shadow-lg`}
      >
        <div className="flex flex-col gap-4 sm:gap-0 h-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            {/* Level Selection */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="level-select"
                className="text-white font-semibold text-lg"
              >
                Select Level:
              </label>
              <select
                id="level-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-2 py-1 rounded border bg-neutral text-white focus:outline-hidden"
              >
                {Object.keys(formattedStages).map((levelName) => (
                  <option
                    key={levelName}
                    value={levelName}
                    className="bg-gray-800"
                  >
                    {levelName}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort & Advanced Filters */}
            <div className="flex flex-col gap-2">
              <label className="text-white font-semibold text-lg">
                Sort By:
              </label>
              <RadioGroup
                name="Filter Options"
                value={selectedFilter}
                onChange={(val) => setSelectedFilter(val)}
              >
                {statAttributes.map((stat) => (
                  <div
                    key={stat.attribute_name}
                    className="flex gap-1 items-center"
                  >
                    <RadioButton
                      value={stat.attribute_name}
                      label={stat.attribute_name}
                    />
                    <div className="relative group">
                      <CircleQuestionIcon className="size-4 text-slate-400" />
                      <div className="absolute top-auto bottom-full -translate-x-1/4 mb-2 sm:top-1/2 sm:bottom-auto sm:left-full sm:translate-x-2 sm:-translate-y-1/2 w-max px-2 py-1 text-sm text-white bg-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none max-w-[200px] lg:max-w-max z-10">
                        Records are sorted based on the{" "}
                        <b>{stat.attribute_name}</b> of the run
                      </div>
                    </div>
                  </div>
                ))}

                {/* Advanced Filters */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row items-center gap-1">
                    <RadioButton value="advanced" label="Advanced Filters" />
                  </div>

                  {selectedFilter === "advanced" && (
                    <div className="text-white bg-neutral rounded-lg p-2">
                      <p className="font-semibold mb-2">Adjust Weights (%)</p>
                      <p className="text-sm text-gray-300 mb-4 italic">
                        <span className="font-semibold">Formula:</span> ∑
                        <sub>x</sub> [Stage<sub>x</sub>Weight × ∑<sub>y</sub>{" "}
                        (Stage<sub>x</sub>Attr<sub>y</sub>Weight × Stage
                        <sub>x</sub>Attr<sub>y</sub>Value)]
                      </p>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {renderStatSliders()}
                        {renderStageSliders()}
                      </div>
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>

            {/* Date Picker */}
            <div className="flex flex-col flex-wrap gap-2">
              <p className="font-semibold text-white text-lg">
                Select Date Range:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => date && setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  dateFormat="yyyy-MM-dd"
                  className="p-1 border rounded-md bg-neutral max-w-[110px] text-white"
                />
                <span className="font-bold text-white">to</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => date && setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  dateFormat="yyyy-MM-dd"
                  className="p-1 border rounded-md bg-neutral max-w-[110px] text-white"
                />
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-center sm:self-end">
            <button
              className="w-full bg-primary text-white px-4 py-2 rounded-lg shadow-lg 
            hover:bg-tertiary transition-all"
              onClick={handleApplyFiltersButton}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSearch;
