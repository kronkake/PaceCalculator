import React, { useState } from "react";
import styled from "styled-components";
import { Dialog } from "../../components/Dialog";
import { TabItem, Tabs } from "../../components/Tabs";
import {
  DistanceList,
  DistanceListItem,
  RowLabel,
  RowValue,
} from "../../components/ListItems";
import { distances } from "../../units/units";
import { fancyTimeFormat, formatTime } from "../../utils/paceFormats";
import { calculateVdot, predictTimeVdot } from "../../utils/vdot";
import {
  predictTimeCameron,
  predictTimeRiegel,
} from "../../utils/racePredictions";
import { calculateSplits } from "../../utils/splits";

const Intro = styled.p`
  margin: 0 0 12px;
  color: var(--color-text-muted);
  font-size: 0.95rem;
`;

const SegmentedControl = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
`;

const SegmentButton = styled.button<{ $active: boolean }>`
  flex: 1;
  border: none;
  padding: 10px 8px;
  min-height: 40px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  color: ${({ $active }) =>
    $active ? "var(--color-primary)" : "var(--color-text-muted)"};
  background: ${({ $active }) =>
    $active ? "var(--color-surface)" : "transparent"};
  box-shadow: ${({ $active }) => ($active ? "var(--shadow-sm)" : "none")};
  transition: background-color 0.15s ease, color 0.15s ease;

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
  }
`;

const BaseBadge = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  border-radius: 999px;
  padding: 3px 8px;
`;

export interface PredictionBase {
  km: number;
  label: string;
  seconds: number;
}

type PredictionFormula = "vdot" | "riegel" | "cameron";

const predictionFormulas: Record<
  PredictionFormula,
  {
    label: string;
    predict: (
      baseMeters: number,
      baseSeconds: number,
      targetMeters: number,
    ) => number;
  }
> = {
  vdot: { label: "VDOT", predict: predictTimeVdot },
  riegel: { label: "Riegel", predict: predictTimeRiegel },
  cameron: { label: "Cameron", predict: predictTimeCameron },
};

const formatSeconds = (seconds: number) =>
  formatTime(fancyTimeFormat(Math.round(seconds)));

interface PredictionDialogProps {
  open: boolean;
  onClose: () => void;
  /* Keep the last base while the dialog animates closed, so the content
     doesn't vanish mid-transition. */
  base: PredictionBase | null;
}

// Race predictions and even-pace split times for a base result, presented
// as two tabs inside a modal dialog.
export const PredictionDialog = ({
  open,
  onClose,
  base,
}: PredictionDialogProps) => {
  const [formula, setFormula] = useState<PredictionFormula>("vdot");

  if (!base) {
    return null;
  }

  const vdot = calculateVdot(base.km * 1000, base.seconds);

  const predictions = distances.map((distance) => {
    const isBase = distance.km === base.km;
    return {
      ...distance,
      isBase,
      time: formatSeconds(
        isBase
          ? base.seconds
          : predictionFormulas[formula].predict(
              base.km * 1000,
              base.seconds,
              distance.km * 1000,
            ),
      ),
    };
  });

  const splits = calculateSplits(base.km, base.seconds);

  // Short races split on 200m, so label those points in meters.
  const splitLabel = (km: number) =>
    base.km < 2
      ? `${Math.round(km * 1000)} m`
      : `${parseFloat(km.toFixed(3))} km`;

  const tabs: TabItem[] = [
    {
      label: "Prognoser",
      content: (
        <>
          <SegmentedControl role="group" aria-label="Velg formel">
            {(Object.keys(predictionFormulas) as PredictionFormula[]).map(
              (id) => (
                <SegmentButton
                  key={id}
                  type="button"
                  $active={formula === id}
                  aria-pressed={formula === id}
                  onClick={() => setFormula(id)}
                >
                  {predictionFormulas[id].label}
                </SegmentButton>
              ),
            )}
          </SegmentedControl>
          {formula === "vdot" && <Intro>VDOT {vdot.toFixed(1)}</Intro>}
          <DistanceList>
            {predictions.map((prediction) => (
              <DistanceListItem
                key={prediction.label}
                $highlighted={prediction.isBase}
              >
                <RowLabel>
                  {prediction.label}
                  {prediction.isBase && <BaseBadge>Utgangspunkt</BaseBadge>}
                </RowLabel>
                <RowValue>{prediction.time}</RowValue>
              </DistanceListItem>
            ))}
          </DistanceList>
        </>
      ),
    },
    {
      label: "Mellomtider",
      content: (
        <>
          <Intro>
            Jevn fart: {formatSeconds(base.seconds / base.km)} pr km
          </Intro>
          <DistanceList>
            {splits.map((split) => (
              <DistanceListItem key={split.km} $highlighted={split.isFinish}>
                <RowLabel>
                  {split.isFinish
                    ? `Mål (${splitLabel(split.km)})`
                    : splitLabel(split.km)}
                </RowLabel>
                <RowValue>{formatSeconds(split.seconds)}</RowValue>
              </DistanceListItem>
            ))}
          </DistanceList>
        </>
      ),
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${base.label} på ${formatSeconds(base.seconds)}`}
    >
      <Tabs tabs={tabs} />
    </Dialog>
  );
};
