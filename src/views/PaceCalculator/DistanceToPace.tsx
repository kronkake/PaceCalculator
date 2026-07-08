import React, { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import { Select } from "../../components/Select";
import styled from "styled-components";
import { carryTimeOverflow, formatTime } from "../../utils/paceFormats";
import { distances } from "../../units/units";
import { CountInput } from "../../components/CountInput";
import { CountInputLayout } from "../../layout/CountLayout";
import { DistanceToPaceUnits } from "../../types/types";
import {
  calculateRequiredSpeed,
  convertKmHToMilesPace,
  convertKmHToMph,
  convertKmToMiles,
  convertKmToPace,
  convertMilesToKm,
  convertPaceToSeconds,
} from "../../utils/paceConversation";
import { UnitMode } from "../../units/useUnitMode";
import {
  DistanceList,
  DistanceListItem,
  RowLabel,
  RowValue,
} from "../../components/ListItems";
import { ChevronRightIcon } from "../../icons/ChevronRight";
import { PredictionBase, PredictionDialog } from "./PredictionDialog";
import { useTranslation } from "../../i18n/i18n";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-height: 0;
`;

const Label = styled.div`
  color: var(--color-text-muted);
  font-size: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;

  /* The select doesn't fit next to the input on narrow screens. */
  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

// In "both" mode two distance inputs share the wrapper; without a minimum
// each one gets squeezed until the value disappears under the +/- buttons,
// so they wrap to their own row instead.
const DistanceInputs = styled(CountInputLayout)`
  flex-wrap: wrap;

  > * {
    flex: 1 1 150px;
  }
`;

// In "both" mode there is one dropdown per unit; stacked, since two race
// names don't fit side by side.
const SelectStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OrText = styled.span`
  color: var(--color-text-muted);
  font-size: 0.9rem;
  padding: 0 8px;
  align-self: center;
`;

// Tonal call-to-action for opening the prediction dialog; unlike the result
// rows above it, this should read as a button.
const PredictButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 48px;
  padding: 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease;

  & > svg {
    flex: 0 0 auto;
  }

  &:disabled {
    cursor: default;
    background: var(--color-surface-alt);
    color: var(--color-text-muted);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 1px;
  }
`;

interface CalculatedResults {
  pacePerKm: string;
  kmPerHour: string;
  pacePerMile: string;
  milesPerHour: string;
}

const emptyResults: CalculatedResults = {
  pacePerKm: "",
  kmPerHour: "",
  pacePerMile: "",
  milesPerHour: "",
};

// Distance fields show at most three decimals, without trailing zeros.
const formatDistanceValue = (value: number) => String(parseFloat(value.toFixed(3)));

// The km field is canonical; the miles field is a synced view of it.
const deriveMiles = (km: string) => {
  const kmNumber = parseFloat(km);
  return kmNumber > 0 ? formatDistanceValue(convertKmToMiles(kmNumber)) : "";
};

const deriveKm = (miles: string) => {
  const milesNumber = parseFloat(miles);
  return milesNumber > 0 ? formatDistanceValue(convertMilesToKm(milesNumber)) : "";
};

const timeUnits = ["hours", "minutes", "seconds"] as const;
type TimeUnit = (typeof timeUnits)[number];

// Entering a value in a unit implies the smaller units are "00"; larger
// units stay empty until the user (or a carry) fills them.
const fillSmallerUnits = (
  name: TimeUnit,
  current: Record<TimeUnit, string>,
) => {
  const filled: Partial<Record<TimeUnit, string>> = {};
  for (const unit of timeUnits.slice(timeUnits.indexOf(name) + 1)) {
    if (!current[unit]) {
      filled[unit] = "00";
    }
  }
  return filled;
};

export const DistanceToPace = ({ unitMode }: { unitMode: UnitMode }) => {
  const { t, distanceLabel } = useTranslation();
  const initialState: Record<DistanceToPaceUnits, string> = {
    hours: "",
    minutes: "",
    seconds: "",
    distance: "",
    miles: "",
  };

  // One option list per unit; both carry the canonical km value, so either
  // dropdown drives the same distance state.
  const distanceOptionsFor = (unit: "km" | "miles") =>
    distances.map((distance) => ({
      value: distance.km.toString(),
      label:
        unit === "km"
          ? `${distanceLabel(distance.label)} (${distance.km} km)`
          : `${distanceLabel(distance.label)} (${convertKmToMiles(distance.km).toFixed(2)} mi)`,
    }));

  const [state, setState] = useState(initialState);
  const [results, setResults] = useState<CalculatedResults>(emptyResults);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [predictionBase, setPredictionBase] = useState<PredictionBase | null>(
    null,
  );

  // The results effect below recalculates on every state change, so typing
  // is already live; blur only normalizes the time fields.
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const targetName = e.target.name as keyof typeof initialState;

    setState((prevState) => {
      if (targetName === "distance") {
        return {
          ...prevState,
          distance: e.target.value,
          miles: deriveMiles(e.target.value),
        };
      }
      if (targetName === "miles") {
        return {
          ...prevState,
          miles: e.target.value,
          distance: deriveKm(e.target.value),
        };
      }
      const next = { ...prevState, [targetName]: e.target.value };
      if (e.target.value) {
        return { ...next, ...fillSmallerUnits(targetName, next) };
      }
      return next;
    });
  };

  // Blur normalizes the whole time: overflow carries upward, so 90 minutes
  // becomes 01:30:00 and 900 seconds becomes 15 minutes.
  const calculate = (e: FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof typeof initialState;
    setState((prevState) => {
      if (name === "distance" || name === "miles") {
        return prevState;
      }
      return { ...prevState, ...carryTimeOverflow(prevState, true) };
    });
  };

  const stepField = (fieldName: DistanceToPaceUnits, step: number) => {
    setState((prevState) => {
      const steppedValue = String(
        Math.max(0, Number(prevState[fieldName] || "0") + step),
      );
      if (fieldName === "distance") {
        return {
          ...prevState,
          distance: steppedValue,
          miles: deriveMiles(steppedValue),
        };
      }
      if (fieldName === "miles") {
        return {
          ...prevState,
          miles: steppedValue,
          distance: deriveKm(steppedValue),
        };
      }
      const next = {
        ...prevState,
        [fieldName]: steppedValue,
        ...fillSmallerUnits(fieldName, {
          ...prevState,
          [fieldName]: steppedValue,
        }),
      };
      // Carrying lets a stepper roll over into the next unit instead of
      // stopping at 59.
      return { ...next, ...carryTimeOverflow(next, true) };
    });
  };

  const handleIncrement = (fieldName: DistanceToPaceUnits) =>
    stepField(fieldName, 1);

  const handleDecrement = (fieldName: DistanceToPaceUnits) =>
    stepField(fieldName, -1);

  const enteredDistanceKm = parseFloat(state.distance);

  // The select only reflects the typed distance when it numerically matches
  // a known race ("10", "10.0" and "10.00" all mean 10k). Any other value
  // shows a "custom distance" placeholder instead of jumping around.
  // Tolerance instead of equality so a distance entered in miles (which
  // round-trips through rounded decimals) still snaps to the race.
  const matchedDistance = distances.find(
    (distance) => Math.abs(distance.km - enteredDistanceKm) < 0.01,
  );
  const selectValue = matchedDistance ? matchedDistance.km.toString() : "";
  // The unit lives in the label above the select; the placeholder only
  // reports the selection state.
  const selectPlaceholder =
    state.distance && !matchedDistance ? t.customDistance : t.selectDistance;
  const selectLabelFor = (unit: "km" | "miles") =>
    unit === "km" ? t.selectDistanceKm : t.selectDistanceMiles;
  const enteredSeconds = convertPaceToSeconds({
    hours: state.hours,
    minutes: state.minutes,
    seconds: state.seconds,
  });
  const canPredict = enteredDistanceKm > 0 && enteredSeconds > 0;

  const openPredictions = () => {
    if (!canPredict) return;

    const label =
      matchedDistance?.label ??
      (unitMode === "miles"
        ? `${formatDistanceValue(convertKmToMiles(enteredDistanceKm))} ${t.milesSuffix}`
        : `${enteredDistanceKm} ${t.kmSuffix}`);
    setPredictionBase({
      km: matchedDistance?.km ?? enteredDistanceKm,
      label,
      seconds: enteredSeconds,
    });
    setDialogOpen(true);
  };

  useEffect(() => {
    const distance = parseFloat(state.distance);
    const totalSeconds = convertPaceToSeconds({
      hours: state.hours,
      minutes: state.minutes,
      seconds: state.seconds,
    });

    // A calculation needs both a distance and a time; anything else shows
    // empty results instead of NaN/Infinity artifacts.
    if (!distance || distance <= 0 || totalSeconds <= 0) {
      setResults(emptyResults);
      return;
    }
    const requiredSpeedKmPerHour = calculateRequiredSpeed(distance, {
      hours: state.hours,
      minutes: state.minutes,
      seconds: state.seconds,
    });
    const time = convertKmToPace(requiredSpeedKmPerHour);
    const mileTime = convertKmHToMilesPace(requiredSpeedKmPerHour);
    setResults({
      pacePerKm: formatTime(time),
      kmPerHour: requiredSpeedKmPerHour,
      pacePerMile: formatTime(mileTime),
      milesPerHour: convertKmHToMph(requiredSpeedKmPerHour),
    });
  }, [state.hours, state.minutes, state.seconds, state.distance]);

  const showKm = unitMode !== "miles";
  const showMiles = unitMode !== "km";

  return (
    <Wrap>
      <CountInputLayout>
        <CountInput
          placeholder="00"
          label={t.hours}
          onIncrement={() => handleIncrement("hours")}
          onDecrement={() => handleDecrement("hours")}
          name="hours"
          value={state.hours}
          onChange={onChange}
          onBlur={calculate}
        />
        <CountInput
          placeholder="00"
          label={t.minutes}
          onIncrement={() => handleIncrement("minutes")}
          onDecrement={() => handleDecrement("minutes")}
          name="minutes"
          value={state.minutes}
          onChange={onChange}
          onBlur={calculate}
        />
        <CountInput
          placeholder="00"
          name="seconds"
          label={t.seconds}
          onIncrement={() => handleIncrement("seconds")}
          onDecrement={() => handleDecrement("seconds")}
          value={state.seconds}
          onChange={onChange}
          onBlur={calculate}
        />
      </CountInputLayout>

      <Label>
        <InputGroup>
          <InputWrapper>
            <DistanceInputs>
              {showKm && (
                <CountInput
                  placeholder="42.195"
                  label={t.distanceKm}
                  onIncrement={() => handleIncrement("distance")}
                  onDecrement={() => handleDecrement("distance")}
                  value={state.distance}
                  onChange={onChange}
                  onBlur={calculate}
                  name="distance"
                />
              )}
              {showMiles && (
                <CountInput
                  placeholder="26.22"
                  label={t.distanceMiles}
                  onIncrement={() => handleIncrement("miles")}
                  onDecrement={() => handleDecrement("miles")}
                  value={state.miles}
                  onChange={onChange}
                  onBlur={calculate}
                  name="miles"
                />
              )}
            </DistanceInputs>
          </InputWrapper>
          <OrText>{t.or}</OrText>
          <InputWrapper>
            <SelectStack>
              {showKm && (
                <Select
                  label={selectLabelFor("km")}
                  placeholder={selectPlaceholder}
                  name="distance"
                  value={selectValue}
                  onChange={onChange}
                  options={distanceOptionsFor("km")}
                />
              )}
              {showMiles && (
                <Select
                  label={selectLabelFor("miles")}
                  placeholder={selectPlaceholder}
                  name="distance"
                  value={selectValue}
                  onChange={onChange}
                  options={distanceOptionsFor("miles")}
                />
              )}
            </SelectStack>
          </InputWrapper>
        </InputGroup>
      </Label>

      <DistanceList>
        {showKm && (
          <>
            <DistanceListItem>
              <RowLabel>{t.minutesPerKm}</RowLabel>
              <RowValue>{results.pacePerKm}</RowValue>
            </DistanceListItem>
            <DistanceListItem>
              <RowLabel>{t.kmPerHour}</RowLabel>
              <RowValue>
                {results.kmPerHour ? `${results.kmPerHour} ${t.kmhUnit}` : ""}
              </RowValue>
            </DistanceListItem>
          </>
        )}
        {showMiles && (
          <>
            <DistanceListItem>
              <RowLabel>{t.minutesPerMile}</RowLabel>
              <RowValue>{results.pacePerMile}</RowValue>
            </DistanceListItem>
            <DistanceListItem>
              <RowLabel>{t.milesPerHour}</RowLabel>
              <RowValue>
                {results.milesPerHour
                  ? `${results.milesPerHour} ${t.mphUnit}`
                  : ""}
              </RowValue>
            </DistanceListItem>
          </>
        )}
      </DistanceList>

      <PredictButton
        type="button"
        disabled={!canPredict}
        onClick={openPredictions}
      >
        {t.predictButton}
        <ChevronRightIcon size={16} aria-hidden="true" />
      </PredictButton>

      <PredictionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        base={predictionBase}
        unitMode={unitMode}
      />
    </Wrap>
  );
};
