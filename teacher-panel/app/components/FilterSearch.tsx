"use client";
import { useState, useEffect } from "react";
import { RadioGroup } from "./RadioGroup";
import { RadioButton } from "./RadioButton";
import { CircleQuestionIcon, FiltersIcon } from "../icons";
import { useSharedData } from "../contexts/SharedDataContext";

const FilterSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { formattedStages, statAttributes } = useSharedData();
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("option1");
  const [attributeInputs, setAttributeInputs] = useState<
    Record<string, number>
  >({});
  const [stageInputs, setStageInputs] = useState<Record<string, number>>({});

  useEffect(() => {
    const levelNames = Object.keys(formattedStages);
    if (levelNames.length > 0) {
      setSelectedLevel(levelNames[0]);
    }
  }, [formattedStages]);

  return (
    <div className="relative mt-2 mb-2">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex align-middle items-center gap-1 bg-primary text-white px-3 py-1 rounded-lg font-bold hover:bg-tertiary transition"
      >
        <FiltersIcon className="size-5" />
        {isOpen ? "Hide Filters" : "Filters"}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out transform origin-top ${
          isOpen ? "scale-y-100 opacity-100 p-4" : "scale-y-0 opacity-0 max-h-0"
        } overflow-hidden bg-zinc-800 rounded-lg mt-2 shadow-lg`}
      >
        <div className="flex flex-col gap-4 md:gap-12 lg:gap-24 sm:flex-row">
          {/* Left side: Level selection */}
          <div className="flex flex-col gap-2 ">
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
              className="px-2 py-1 rounded border bg-neutral text-white focus:outline-none"
            >
              {Object.keys(formattedStages).map((levelName) => (
                <option
                  className="bg-gray-800"
                  key={levelName}
                  value={levelName}
                >
                  {levelName}
                </option>
              ))}
            </select>
          </div>

          {/* Right side: Radio buttons and conditional advanced filters */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="level-select"
              className="text-white font-semibold text-lg"
            >
              Sort By:
            </label>
            <RadioGroup
              name="Filter Options"
              defaultValue="option1"
              onChange={(val) => {
                setSelectedFilter(val);
                console.log("Selected:", val);
              }}
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
                    <div
                      className="absolute top-1/2 left-full transform -translate-y-1/2 translate-x-2 w-max 
                      px-2 py-1 text-sm text-white bg-gray-700 rounded shadow-lg 
                      opacity-0 group-hover:opacity-100 pointer-events-none"
                    >
                      Records are sorted based on the{" "}
                      <b>{stat.attribute_name}</b> of the run
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-1">
                  <RadioButton value="option3" label="Advanced Filters" />
                  <div className="relative group">
                    <CircleQuestionIcon className="size-4 text-slate-400" />
                    <div
                      className="absolute top-1/2 left-full transform -translate-y-1/2 translate-x-2 w-max 
                      px-2 py-1 text-sm text-white bg-gray-700 rounded shadow-lg 
                      opacity-0 group-hover:opacity-100 pointer-events-none"
                    >
                      Records are sorted based on <b>weighted attributes</b>
                    </div>
                  </div>
                </div>

                {selectedFilter === "option3" && (
                  <div className="text-white bg-neutral rounded-lg">
                    <p className="font-semibold mb-2">Adjust Weights (%)</p>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Stat Attribute Sliders */}
                      {statAttributes.map((stat) => (
                        <div
                          key={stat.attribute_name}
                          className="flex flex-col items-start gap-1 w-full"
                        >
                          <label className="text-sm">
                            {stat.attribute_name}:{" "}
                            {attributeInputs[stat.attribute_name] ?? 0}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={attributeInputs[stat.attribute_name] ?? 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setAttributeInputs((prev) => ({
                                ...prev,
                                [stat.attribute_name]: val,
                              }));
                            }}
                            className="w-full accent-primary"
                          />
                        </div>
                      ))}

                      {/* Stage Sliders */}
                      {formattedStages[selectedLevel]?.map((stage) => (
                        <div
                          key={stage}
                          className="flex flex-col items-start gap-1 w-full"
                        >
                          <label className="text-sm">
                            {stage}: {stageInputs[stage] ?? 0}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={stageInputs[stage] ?? 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setStageInputs((prev) => ({
                                ...prev,
                                [stage]: val,
                              }));
                            }}
                            className="w-full accent-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSearch;
