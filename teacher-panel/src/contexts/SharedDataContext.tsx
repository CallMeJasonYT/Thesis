"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface FilterState {
  selectedLevel: string;
  startDate: Date;
  endDate: Date;
  selectedFilter: string;
  attributeInputs: Record<string, number>;
  stageInputs: Record<string, number>;
}

interface SharedData {
  formattedStages: Record<string, string[]>;
  groups: { group_name: string }[];
  statAttributes: { attribute_name: string }[];
  filters: FilterState | null;
  setFilters: (filters: FilterState) => void;
  isLoading: boolean; // Add loading state
}

const SharedDataContext = createContext<SharedData>({
  formattedStages: {},
  groups: [],
  statAttributes: [],
  filters: null,
  setFilters: () => {},
  isLoading: true, // Default to loading
});

export const SharedDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formattedStages, setFormattedStages] = useState<
    Record<string, string[]>
  >({});
  const [groups, setGroups] = useState<{ group_name: string }[]>([]);
  const [statAttributes, setStatAttributes] = useState<
    { attribute_name: string }[]
  >([]);
  const [filters, setFilters] = useState<FilterState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [stageRes, groupRes, statAttrbutesRes] = await Promise.all([
          fetch(
            `http://${process.env.NEXT_PUBLIC_SERVERIP}:${process.env.NEXT_PUBLIC_APIPORT}/api/web/levelStages`
          ),
          fetch(
            `http://${process.env.NEXT_PUBLIC_SERVERIP}:${process.env.NEXT_PUBLIC_APIPORT}/api/web/groups`
          ),
          fetch(
            `http://${process.env.NEXT_PUBLIC_SERVERIP}:${process.env.NEXT_PUBLIC_APIPORT}/api/web/statsAttributes`
          ),
        ]);

        const [stageData, groupData, statAttributeData] = await Promise.all([
          stageRes.json(),
          groupRes.json(),
          statAttrbutesRes.json(),
        ]);

        const formattedStages: Record<string, string[]> = {};
        stageData.data.forEach((entry: any) => {
          formattedStages[entry.level_name] = entry.stages;
        });

        setFormattedStages(formattedStages);
        setGroups(groupData.groupData);
        setStatAttributes(statAttributeData.attributeData);

        if (
          Object.keys(formattedStages).length > 0 &&
          statAttributeData.attributeData.length > 0
        ) {
          initializeDefaultFilters(
            formattedStages,
            statAttributeData.attributeData
          );
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Helper function to initialize default filters
  const initializeDefaultFilters = (
    stages: Record<string, string[]>,
    attributes: { attribute_name: string }[]
  ) => {
    const levelNames = Object.keys(stages);
    if (levelNames.length === 0 || attributes.length === 0) return;

    const selectedLevel = levelNames[0];
    const initialAttributes: Record<string, number> = {};
    const initialStages: Record<string, number> = {};

    attributes.forEach((stat) => {
      initialAttributes[stat.attribute_name] = 100;
    });

    stages[selectedLevel].forEach((stage) => {
      initialStages[stage] = 100;
    });

    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);

    setFilters({
      selectedLevel: selectedLevel,
      startDate: start,
      endDate: today,
      selectedFilter: attributes[0]?.attribute_name || "",
      attributeInputs: initialAttributes,
      stageInputs: initialStages,
    });
  };

  return (
    <SharedDataContext.Provider
      value={{
        formattedStages,
        groups,
        statAttributes,
        filters,
        setFilters,
        isLoading,
      }}
    >
      {children}
    </SharedDataContext.Provider>
  );
};

export const useSharedData = () => useContext(SharedDataContext);
