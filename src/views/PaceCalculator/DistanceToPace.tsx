import React, { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import { Select } from "../../components/Select";
import styled from "styled-components";
import {
  carryTimeOverflow,
  formatTime,
  unitFormater,
} from "../../utils/paceFormats";
import { distances } from "../../units/units";
import { CountInput } from "../../components/CountInput";
import { CountInputLayout } from "../../layout/CountLayout";
import { DistanceToPaceUnits } from "../../types/types";
import {
  calculateRequiredSpeed,
  convertKmToPace,
  convertPaceToSeconds,
} from "../../utils/paceConversation";
import {
  DistanceList,
  DistanceListItem,
  RowLabel,
  RowValue,
} from "../../components/ListItems";
import { ChevronRightIcon } from "../../icons/ChevronRight";
import { PredictionBase, PredictionDialog } from "./PredictionDialog";

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
  transition: background-color 0.15s ease, color 0.15s ease,
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
}

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

export const DistanceToPace = () => {
  const initialState: Record<DistanceToPaceUnits, string> = {
    hours: "",
    minutes: "",
    seconds: "",
    distance: "",
  };

  // Create options for the select from distances
  const distanceOptions = distances.map((distance) => ({
    value: distance.km.toString(),
    label: `${distance.label} (${distance.km}km)`,
  }));

  const [state, setState] = useState(initialState);
  const [results, setResults] = useState<CalculatedResults>({
    pacePerKm: "",
    kmPerHour: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [predictionBase, setPredictionBase] = useState<PredictionBase | null>(
    null,
  );

  // The results effect below recalculates on every state change, so typing
  // is already live; blur only normalizes the time fields.
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const targetName = e.target.name as keyof typeof initialState;

    setState((prevState) => {
      const next = { ...prevState, [targetName]: e.target.value };
      if (targetName !== "distance" && e.target.value) {
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
      if (name === "distance") {
        return {
          ...prevState,
          distance: unitFormater.distance(prevState.distance),
        };
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
          distance: unitFormater.distance(steppedValue),
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
  const matchedDistance = distances.find(
    (distance) => distance.km === enteredDistanceKm,
  );
  const selectValue = matchedDistance ? matchedDistance.km.toString() : "";
  const selectPlaceholder =
    state.distance && !matchedDistance
      ? "Egendefinert distanse"
      : "Velg distanse";
  const enteredSeconds = convertPaceToSeconds({
    hours: state.hours,
    minutes: state.minutes,
    seconds: state.seconds,
  });
  const canPredict = enteredDistanceKm > 0 && enteredSeconds > 0;

  const openPredictions = () => {
    if (!canPredict) return;

    const label =
      distances.find((distance) => distance.km === enteredDistanceKm)?.label ??
      `${enteredDistanceKm} km`;
    setPredictionBase({
      km: enteredDistanceKm,
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
      setResults({
        pacePerKm: "",
        kmPerHour: "",
      });
      return;
    }
    const requiredSpeedKmPerHour = calculateRequiredSpeed(distance, {
      hours: state.hours,
      minutes: state.minutes,
      seconds: state.seconds,
    });
    const time = convertKmToPace(requiredSpeedKmPerHour);
    setResults({
      pacePerKm: formatTime(time),
      kmPerHour: requiredSpeedKmPerHour,
    });
  }, [state.hours, state.minutes, state.seconds, state.distance]);

  return (
    <Wrap>
      <CountInputLayout>
        <CountInput
          placeholder="00"
          label="Timer"
          onIncrement={() => handleIncrement("hours")}
          onDecrement={() => handleDecrement("hours")}
          name="hours"
          value={state.hours}
          onChange={onChange}
          onBlur={calculate}
        />
        <CountInput
          placeholder="00"
          label="Minutter"
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
          label="Sekunder"
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
            <CountInput
              placeholder="42.195"
              label="Distanse (km)"
              onIncrement={() => handleIncrement("distance")}
              onDecrement={() => handleDecrement("distance")}
              value={state.distance}
              onChange={onChange}
              onBlur={calculate}
              name="distance"
            />
          </InputWrapper>
          <OrText>eller</OrText>
          <InputWrapper>
            <Select
              placeholder={selectPlaceholder}
              name="distance"
              value={selectValue}
              onChange={onChange}
              options={distanceOptions}
            />
          </InputWrapper>
        </InputGroup>
      </Label>

      <DistanceList>
        <DistanceListItem>
          <RowLabel>Minutter pr kilometer</RowLabel>
          <RowValue>{results.pacePerKm}</RowValue>
        </DistanceListItem>
        <DistanceListItem>
          <RowLabel>Kilometer i timen</RowLabel>
          <RowValue>
            {results.kmPerHour ? `${results.kmPerHour} km/t` : ""}
          </RowValue>
        </DistanceListItem>
      </DistanceList>

      <PredictButton
        type="button"
        disabled={!canPredict}
        onClick={openPredictions}
      >
        Prognoser og mellomtider
        <ChevronRightIcon size={16} aria-hidden="true" />
      </PredictButton>

      <PredictionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        base={predictionBase}
      />
    </Wrap>
  );
};
