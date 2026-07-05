import React, { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import styled from "styled-components";
import { PaceToDistanceUnits as PaceCalcUnits } from "../../types/types";
import {
  carryTimeOverflow,
  formatTime,
  unitFormater,
} from "../../utils/paceFormats";
import { distances } from "../../units/units";
import {
  convertKmToPace,
  convertPaceToKm,
  convertPaceToSeconds,
  convertDistanceToTimeBasedOnPace,
} from "../../utils/paceConversation";
import { CountInput } from "../../components/CountInput";
import { CountInputLayout } from "../../layout/CountLayout";
import {
  Chevron,
  DistanceList,
  DistanceListItemButton,
  RowLabel,
  RowValue,
} from "../../components/ListItems";
import { PredictionBase, PredictionDialog } from "./PredictionDialog";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-height: 0;
`;

// The main distance list gives way before the inputs do: it keeps room for
// a couple of rows and scrolls internally on short viewports.
const ScrollableDistanceList = styled(DistanceList)`
  overflow-y: auto;
  min-height: 7.5em;
`;

interface formattedDistances {
  km: number;
  label: string;
  formattedTime: string;
}

export const PaceToDistance = () => {
  const initialState: Record<PaceCalcUnits, string> = {
    minutes: "",
    seconds: "",
    km: "",
  };

  // Each entry returns the edited field plus the fields derived from it, so
  // every input path (typing, blur, steppers) keeps the others in sync.
  const calculateState: Record<
    PaceCalcUnits,
    (
      newValue: string,
      current: typeof initialState,
    ) => Partial<typeof initialState>
  > = {
    km: (newValue) => {
      const { minutes, seconds } = convertKmToPace(newValue);
      return { km: newValue, minutes, seconds };
    },
    minutes: (newValue, current) => {
      // Entering minutes implies whole minutes: an empty seconds field
      // becomes "00" instead of staying blank.
      const seconds = current.seconds || (newValue ? "00" : "");
      return {
        minutes: newValue,
        seconds,
        km: convertPaceToKm({ minutes: newValue, seconds }),
      };
    },
    seconds: (newValue, current) => ({
      seconds: newValue,
      km: convertPaceToKm({ minutes: current.minutes, seconds: newValue }),
    }),
  };

  const [state, setState] = useState(initialState);
  const [formattedTimes, setFormattedTimes] = useState<formattedDistances[]>(
    [],
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [predictionBase, setPredictionBase] = useState<PredictionBase | null>(
    null,
  );

  // While typing, derive the other fields from the raw value; formatting the
  // field the user is still editing would fight their input.
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as PaceCalcUnits;
    setState((prevState) => ({
      ...prevState,
      ...calculateState[name](e.target.value, prevState),
    }));
  };

  // On blur the pace gets normalized — overflow carries upward (90 seconds
  // becomes 01:30) — and the derived fields are recalculated from it.
  const doCalculations = (e: FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as PaceCalcUnits;
    setState((prevState) => {
      if (name === "km") {
        return {
          ...prevState,
          ...calculateState.km(unitFormater.km(prevState.km), prevState),
        };
      }
      const carried = carryTimeOverflow(
        { minutes: prevState.minutes, seconds: prevState.seconds },
        false,
      );
      return { ...prevState, ...carried, km: convertPaceToKm(carried) };
    });
  };

  const stepField = (fieldName: PaceCalcUnits, step: number) => {
    setState((prevState) => {
      const steppedValue = String(
        Math.max(0, Number(prevState[fieldName] || "0") + step),
      );
      if (fieldName === "km") {
        return {
          ...prevState,
          ...calculateState.km(unitFormater.km(steppedValue), prevState),
        };
      }
      const pace = {
        minutes: prevState.minutes,
        seconds: prevState.seconds,
        [fieldName]: steppedValue,
      };
      // Same cascade as typing: stepping minutes fills an empty seconds.
      if (fieldName === "minutes" && !pace.seconds) {
        pace.seconds = "00";
      }
      // Carrying lets the seconds stepper roll over into the next minute
      // instead of stopping at 59.
      const carried = carryTimeOverflow(pace, false);
      return { ...prevState, ...carried, km: convertPaceToKm(carried) };
    });
  };

  const handleIncrement = (fieldName: PaceCalcUnits) => stepField(fieldName, 1);
  const handleDecrement = (fieldName: PaceCalcUnits) =>
    stepField(fieldName, -1);

  const openPredictions = (distance: formattedDistances) => {
    const paceSeconds = convertPaceToSeconds({
      minutes: state.minutes,
      seconds: state.seconds,
    });
    if (paceSeconds <= 0) return;

    setPredictionBase({
      km: distance.km,
      label: distance.label,
      seconds: paceSeconds * distance.km,
    });
    setDialogOpen(true);
  };

  useEffect(() => {
    setFormattedTimes(
      distances.map((distance) => {
        const time = convertDistanceToTimeBasedOnPace(
          {
            minutes: state.minutes,
            seconds: state.seconds,
          },
          distance.km,
        );
        return {
          ...distance,
          formattedTime: formatTime(time) || "",
        };
      }),
    );
  }, [state.minutes, state.seconds]);

  return (
    <Wrap>
      <CountInput
        label="Kilometer i timen"
        name="km"
        placeholder="km/t"
        value={state.km}
        onChange={onChange}
        onBlur={doCalculations}
        onIncrement={() => handleIncrement("km")}
        onDecrement={() => handleDecrement("km")}
      />
      <CountInputLayout>
        <CountInput
          onChange={onChange}
          onBlur={doCalculations}
          placeholder="00"
          min="0"
          max="59"
          name="minutes"
          label="Minutter pr kilometer"
          value={state.minutes}
          onIncrement={() => handleIncrement("minutes")}
          onDecrement={() => handleDecrement("minutes")}
        />
        <CountInput
          onChange={onChange}
          onBlur={doCalculations}
          placeholder="00"
          min="0"
          name="seconds"
          label="Sekunder pr kilometer"
          value={state.seconds}
          onIncrement={() => handleIncrement("seconds")}
          onDecrement={() => handleDecrement("seconds")}
        />
      </CountInputLayout>
      <ScrollableDistanceList>
        {formattedTimes.map((distance) => (
          <li key={distance.label}>
            <DistanceListItemButton
              type="button"
              disabled={!distance.formattedTime}
              onClick={() => openPredictions(distance)}
            >
              <RowLabel>{distance.label}</RowLabel>
              {distance.formattedTime && (
                <>
                  <RowValue>{distance.formattedTime}</RowValue>
                  <Chevron />
                </>
              )}
            </DistanceListItemButton>
          </li>
        ))}
      </ScrollableDistanceList>

      <PredictionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        base={predictionBase}
      />
    </Wrap>
  );
};
