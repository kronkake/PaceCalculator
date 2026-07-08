import React from "react";

import styled from "styled-components";
import { PaceToDistance } from "./PaceCalculator/PaceToDistance";
import { TabItem, Tabs } from "../components/Tabs";
import { DistanceToPace } from "./PaceCalculator/DistanceToPace";
import { UnitMode } from "../units/useUnitMode";
import { useTranslation } from "../i18n/i18n";

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

export const PaceCalculator = ({ unitMode }: { unitMode: UnitMode }) => {
  const { t } = useTranslation();
  const tabs: TabItem[] = [
    {
      label: t.tabPace,
      content: <PaceToDistance unitMode={unitMode} />,
    },
    {
      label: t.tabDistance,
      content: <DistanceToPace unitMode={unitMode} />,
    },
  ];

  return (
    <Wrap>
      <Tabs tabs={tabs} />
    </Wrap>
  );
};
