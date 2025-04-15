"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SharedData {
  formattedStages: Record<string, string[]>;
  groups: { group_name: string }[];
  statAttributes: { attribute_name: string }[];
}

const SharedDataContext = createContext<SharedData>({
  formattedStages: {},
  groups: [],
  statAttributes: [],
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

  useEffect(() => {
    const fetchAll = async () => {
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

        console.log("Fetched Stages:", formattedStages);
        console.log("Fetched Groups:", groupData);
        console.log("Fetched Attributes:", statAttributeData);
      } catch (err: any) {
        console.error(err);
      }
    };

    fetchAll();
  }, []);

  return (
    <SharedDataContext.Provider
      value={{ formattedStages, groups, statAttributes }}
    >
      {children}
    </SharedDataContext.Provider>
  );
};

export const useSharedData = () => useContext(SharedDataContext);
