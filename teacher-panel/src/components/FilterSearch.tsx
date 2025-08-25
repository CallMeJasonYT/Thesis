"use client";
import { useState, useEffect, useCallback } from "react";
import { RadioGroup } from "./RadioGroup";
import { RadioButton } from "./RadioButton";
import { IconFilter, IconHelp, IconFilterCheck } from "@tabler/icons-react";
import { useSharedData } from "@/contexts/SharedDataContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import SimpleTooltip from "./simple-tooltip";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const SliderInput = React.memo(
  ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
  }) => {
    return (
      <div className="flex flex-col items-start gap-1 w-full">
        <label className="text-sm">
          {label}: {value}%
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full accent-primary"
        />
      </div>
    );
  }
);

const FilterSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { levelStagesMap, statAttributes, setFilters, filters, isLoading } =
    useSharedData();
  const [selectedLevel, setSelectedLevel] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedFilter, setSelectedFilter] = useState("");
  const [attributeInputs, setAttributeInputs] = useState<{
    [key: string]: number;
  }>({});
  const [stageInputs, setStageInputs] = useState<{ [key: string]: number }>({});

  // --- Load filters from context ---
  useEffect(() => {
    if (!isLoading && filters) {
      setSelectedLevel(filters.selectedLevel);
      setStartDate(filters.startDate);
      setEndDate(filters.endDate);
      setSelectedFilter(filters.selectedFilter);
      setAttributeInputs(filters.attributeInputs);
      setStageInputs(filters.stageInputs);
    }
  }, [isLoading, filters]);

  // --- Reset stageInputs when level changes ---
  useEffect(() => {
    if (selectedLevel && levelStagesMap[selectedLevel]) {
      const newStageInputs: Record<string, number> = {};
      levelStagesMap[selectedLevel].forEach((stage) => {
        newStageInputs[stage] = stageInputs[stage] ?? 100;
      });
      setStageInputs(newStageInputs);
    }
  }, [selectedLevel, levelStagesMap]);

  const handleAttributeChange = useCallback((stat: string, val: number) => {
    setAttributeInputs((prev) => ({ ...prev, [stat]: val }));
  }, []);

  const handleStageChange = useCallback((stage: string, val: number) => {
    setStageInputs((prev) => ({ ...prev, [stage]: val }));
  }, []);

  const renderStatSliders = () =>
    statAttributes.map((stat) => (
      <SliderInput
        key={stat}
        label={stat}
        value={attributeInputs[stat] ?? 100}
        onChange={(val) => handleAttributeChange(stat, val)}
      />
    ));

  const renderStageSliders = () =>
    levelStagesMap[selectedLevel]?.map((stage) => (
      <SliderInput
        key={stage}
        label={stage}
        value={stageInputs[stage] ?? 100}
        onChange={(val) => handleStageChange(stage, val)}
      />
    ));

  const handleApplyFiltersButton = () => {
    setFilters({
      selectedLevel,
      startDate,
      endDate,
      selectedFilter,
      attributeInputs,
      stageInputs,
    });
    setIsOpen(false);
  };

  return (
    <div className="relative mt-2 mb-2">
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1"
        disabled={isLoading}
      >
        <IconFilter className="size-5" />
        {isLoading ? (
          <Skeleton className="h-4 w-16 rounded" />
        ) : isOpen ? (
          "Hide Filters"
        ) : (
          "Filters"
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="filters"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="bg-neutral rounded-lg mt-2 shadow-lg overflow-hidden"
          >
            <div className="p-8 flex flex-col gap-4 sm:gap-0 h-full">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                {/* Level Selection */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-normal lg:text-lg">
                    Select Level:
                  </label>
                  <Select
                    value={selectedLevel}
                    onValueChange={setSelectedLevel}
                  >
                    <SelectTrigger className="bg-neutral border-border rounded-2xl">
                      <SelectValue placeholder={`Select Level:`} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800">
                      {Object.keys(levelStagesMap).map((levelName) => (
                        <SelectItem key={levelName} value={levelName}>
                          {levelName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort & Advanced Filters */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-normal lg:text-lg">
                    Sort By:
                  </label>
                  <RadioGroup
                    name="Filter Options"
                    value={selectedFilter}
                    onChange={(val) => setSelectedFilter(val)}
                  >
                    {statAttributes.map((stat) => (
                      <div key={stat} className="flex gap-1 items-center">
                        <RadioButton value={stat} label={stat} />
                        <SimpleTooltip
                          content={`Records are sorted based on the ${stat} of the run`}
                          side="right"
                        >
                          <IconHelp className="size-4 text-slate-400" />
                        </SimpleTooltip>
                      </div>
                    ))}

                    {/* Advanced Filters */}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row items-center gap-1">
                        <RadioButton
                          value="advanced"
                          label="Advanced Filters"
                        />
                        <SimpleTooltip
                          content={
                            <>
                              <span className="font-semibold">Formula:</span> ∑
                              <sub>x</sub> [Stage<sub>x</sub>Weight × ∑
                              <sub>y</sub> (Stage<sub>x</sub>Attr<sub>y</sub>
                              Weight × Stage
                              <sub>x</sub>Attr<sub>y</sub>Value)]
                            </>
                          }
                          side="right"
                        >
                          <IconHelp className="size-4 text-slate-400 cursor-help" />
                        </SimpleTooltip>
                      </div>

                      {selectedFilter === "advanced" && (
                        <div className="bg-neutral rounded-lg p-2">
                          <p className="font-semibold mb-2">Adjust Weights</p>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <p className="font-semibold text-normal lg:text-lg">
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
                      className="p-1 border rounded-2xl bg-neutral text-center w-[100px] md:w-[150px]"
                    />
                    <span className="font-bold">to</span>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => date && setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      dateFormat="yyyy-MM-dd"
                      className="p-1 border rounded-2xl bg-neutral text-center w-[100px] md:w-[150px]"
                    />
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="flex justify-center sm:self-end">
                <Button
                  className="flex items-center"
                  onClick={handleApplyFiltersButton}
                >
                  <IconFilterCheck className="size-5" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterSearch;
