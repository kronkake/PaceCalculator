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
import { SegmentedControl } from "../../components/SegmentedControl";
import { distances } from "../../units/units";
import { UnitMode } from "../../units/useUnitMode";
import { fancyTimeFormat, formatTime } from "../../utils/paceFormats";
import { convertKmToMiles } from "../../utils/paceConversation";
import { calculateVdot, predictTimeVdot } from "../../utils/vdot";
import {
  predictTimeCameron,
  predictTimeRiegel,
} from "../../utils/racePredictions";
import { calculateSplits } from "../../utils/splits";
import { useTranslation } from "../../i18n/i18n";

const Intro = styled.p`
  margin: 0 0 12px;
  color: var(--color-text-muted);
  font-size: 0.95rem;
`;

const ControlWrap = styled.div`
  margin-bottom: 12px;
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

type SplitUnit = "km" | "miles";

interface PredictionDialogProps {
  open: boolean;
  onClose: () => void;
  /* Keep the last base while the dialog animates closed, so the content
     doesn't vanish mid-transition. */
  base: PredictionBase | null;
  unitMode: UnitMode;
}

const formulaOptions = (
  Object.keys(predictionFormulas) as PredictionFormula[]
).map((id) => ({ value: id, label: predictionFormulas[id].label }));

// Race predictions and even-pace split times for a base result, presented
// as tabs inside a modal dialog; in "both" mode the splits get one tab
// per unit.
export const PredictionDialog = ({
  open,
  onClose,
  base,
  unitMode,
}: PredictionDialogProps) => {
  const { t, distanceLabel } = useTranslation();
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

  const baseMiles = convertKmToMiles(base.km);

  // Splits for one unit: distance, labels and even-pace line all in that
  // unit. Short races split on fractions, so those points get a finer
  // label (meters) where one exists.
  const splitsContent = (unit: SplitUnit) => {
    const splits = calculateSplits(
      unit === "km" ? base.km : baseMiles,
      base.seconds,
    );
    const splitLabel = (value: number) =>
      unit === "km"
        ? base.km < 2
          ? `${Math.round(value * 1000)} m`
          : `${parseFloat(value.toFixed(3))} km`
        : `${parseFloat(value.toFixed(2))} mi`;
    const evenPace =
      unit === "km"
        ? `${formatSeconds(base.seconds / base.km)} ${t.perKm}`
        : `${formatSeconds(base.seconds / baseMiles)} ${t.perMile}`;

    return (
      <>
        <Intro>
          {t.evenPace}: {evenPace}
        </Intro>
        <DistanceList>
          {splits.map((split) => (
            <DistanceListItem key={split.km} $highlighted={split.isFinish}>
              <RowLabel>
                {split.isFinish
                  ? `${t.finish} (${splitLabel(split.km)})`
                  : splitLabel(split.km)}
              </RowLabel>
              <RowValue>{formatSeconds(split.seconds)}</RowValue>
            </DistanceListItem>
          ))}
        </DistanceList>
      </>
    );
  };

  const splitTabs: TabItem[] =
    unitMode === "both"
      ? [
          { label: t.splitsKm, content: splitsContent("km") },
          { label: t.splitsMiles, content: splitsContent("miles") },
        ]
      : [{ label: t.splits, content: splitsContent(unitMode) }];

  const tabs: TabItem[] = [
    {
      label: t.predictions,
      content: (
        <>
          <ControlWrap>
            <SegmentedControl
              ariaLabel={t.selectFormula}
              options={formulaOptions}
              value={formula}
              onChange={setFormula}
            />
          </ControlWrap>
          {formula === "vdot" && <Intro>VDOT {vdot.toFixed(1)}</Intro>}
          <DistanceList>
            {predictions.map((prediction) => (
              <DistanceListItem
                key={prediction.label}
                $highlighted={prediction.isBase}
              >
                <RowLabel>
                  {distanceLabel(prediction.label)}
                  {prediction.isBase && <BaseBadge>{t.baseBadge}</BaseBadge>}
                </RowLabel>
                <RowValue>{prediction.time}</RowValue>
              </DistanceListItem>
            ))}
          </DistanceList>
        </>
      ),
    },
    ...splitTabs,
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${distanceLabel(base.label)} ${t.dialogTitleConnector} ${formatSeconds(base.seconds)}`}
    >
      <Tabs tabs={tabs} />
    </Dialog>
  );
};
