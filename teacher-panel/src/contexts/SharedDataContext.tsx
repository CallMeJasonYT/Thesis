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
  levelStagesMap: Record<string, string[]>;
  //groups: { group_name: string }[];
  statAttributes: [];
  filters: FilterState | null;
  setFilters: (filters: FilterState) => void;
  isLoading: boolean;
}

const SharedDataContext = createContext<SharedData>({
  levelStagesMap: {},
  //groups: [],
  statAttributes: [],
  filters: null,
  setFilters: () => {},
  isLoading: true,
});

export const SharedDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [levelStagesMap, setlevelStagesMap] = useState<
    Record<string, string[]>
  >({});
  //const [groups, setGroups] = useState<{ group_name: string }[]>([]);
  const [statAttributes, setStatAttributes] = useState<[]>([]);
  const [filters, setFilters] = useState<FilterState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [levelStagesRes, /*groupRes,*/ statAttrbutesRes] =
          await Promise.all([
            fetch(
              /*`http://${process.env.NEXT_PUBLIC_SERVER_IP}:${process.env.NEXT_PUBLIC_DB_API_PORT}/api/web/levelStages`*/
              `http://${process.env.NEXT_PUBLIC_SERVER_IP}:${process.env.NEXT_PUBLIC_DB_API_PORT}/api/ariadni/levelStages`
            ),
            /*fetch(
            `http://${process.env.NEXT_PUBLIC_SERVER_IP}:${process.env.NEXT_PUBLIC_DB_API_PORT}/api/web/groups`
          ),*/
            fetch(
              `http://${process.env.NEXT_PUBLIC_SERVER_IP}:${process.env.NEXT_PUBLIC_DB_API_PORT}/api/web/statsAttributes`
            ),
          ]);

        const [stageData, /*groupData,*/ statAttributeData] = await Promise.all(
          [
            levelStagesRes.json(),
            //groupRes.json(),
            statAttrbutesRes.json(),
          ]
        );

        const levelStagesMap: Record<string, string[]> = {};
        console.log(stageData);
        stageData.data.forEach((entry: any) => {
          levelStagesMap[entry.level_name] = entry.stages;
        });

        console.log(levelStagesMap);
        console.log(statAttributeData);
        console.log(statAttributeData.attributeData);

        setlevelStagesMap(levelStagesMap);
        //setGroups(groupData.groupData);
        setStatAttributes(statAttributeData.attributeData);

        if (
          Object.keys(levelStagesMap).length > 0 &&
          statAttributeData.attributeData.length > 0
        ) {
          initializeDefaultFilters(
            levelStagesMap,
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
    attributes: string[]
  ) => {
    const levelNames = Object.keys(stages);
    if (levelNames.length === 0 || attributes.length === 0) return;

    const selectedLevel = levelNames[0];
    const initialAttributes: Record<string, number> = {};
    const initialStages: Record<string, number> = {};

    attributes.forEach((stat) => {
      initialAttributes[stat] = 100;
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
      selectedFilter: attributes[0],
      attributeInputs: initialAttributes,
      stageInputs: initialStages,
    });
  };

  return (
    <SharedDataContext.Provider
      value={{
        levelStagesMap,
        //groups,
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
