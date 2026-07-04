import React from "react";

import styled from "styled-components";
import { PaceToDistance } from "./PaceCalculator/PaceToDistance";
import { TabItem, Tabs } from "../components/Tabs";
import { DistanceToPace } from "./PaceCalculator/DistanceToPace";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7.5px;
  width: 100%;
  max-width: 600px;
  /* Shrink below content height when the viewport is short. */
  min-height: 0;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: background-color 0.25s ease;

  @media (max-width: 560px) {
    border-radius: 0;
  }
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
