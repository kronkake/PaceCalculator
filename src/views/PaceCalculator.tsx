import React from "react";

import styled from "styled-components";
import { PaceToDistance } from "./PaceCalculator/PaceToDistance";
import { TabItem, Tabs } from "../components/Tabs";
import { DistanceToPace } from "./PaceCalculator/DistanceToPace";

const Wrap = styled.div`
  padding-top: 0.5em;
  display: flex;
  flex-direction: column;
  gap: 7.5px;
  width: 100%;
  max-width: 600px;
`;

export const PaceCalculator = () => {
  const tabs: TabItem[] = [
    {
      label: "Kalkuler fart",
      content: <PaceToDistance />,
    },
    {
      label: "Kalkuler distanse",
      content: <DistanceToPace />,
    },
  ];

  return (
    <Wrap>
      <Tabs tabs={tabs} />
    </Wrap>
  );
};
