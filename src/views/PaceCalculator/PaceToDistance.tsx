import React, { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import styled from "styled-components";
import { PaceToDistanceUnits as PaceCalcUnits } from "../../types/types";
import {
  carryTimeOverflow,
  formatTime,
  unitFormater,
} from "../../utils/paceFormats";
import { distances } from "../../units/units";
import { UnitMode } from "../../units/useUnitMode";
import {
  convertKmHToMilesPace,
  convertKmHToMph,
  convertKmToPace,
  convertMilesPaceToKmH,
  convertMphToKmH,
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
import { useTranslation } from "../../i18n/i18n";

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

const emptyState: Record<PaceCalcUnits, string> = {
  km: "",
  mph: "",
  minutes: "",
  seconds: "",
  mileMinutes: "",
  mileSeconds: "",
};

// Every field is a view of the same speed; a valid km/h fills them all,
// anything else empties them all.
const deriveFromKmH = (kmh: string): typeof emptyState => {
  if (!kmh || parseFloat(kmh) <= 0) {
    return { ...emptyState };
  }
  const pace = convertKmToPace(kmh);
  const milePace = convertKmHToMilesPace(kmh);
  return {
    km: kmh,
    mph: convertKmHToMph(kmh),
    minutes: pace.minutes ?? "",
    seconds: pace.seconds ?? "",
    mileMinutes: milePace.minutes ?? "",
    mileSeconds: milePace.seconds ?? "",
  };
};

export const PaceToDistance = ({ unitMode }: { unitMode: UnitMode }) => {
  const { t, distanceLabel } = useTranslation();
  // Each entry returns the whole synced state for an edit of one field: the
  // edited pair keeps its raw values (formatting a field the user is typing
  // in would fight their input), the rest derive from the resulting speed.
  const calculateState: Record<
    PaceCalcUnits,
    (newValue: string, current: typeof emptyState) => typeof emptyState
  > = {
    km: (newValue) => ({ ...deriveFromKmH(newValue), km: newValue }),
    mph: (newValue) => ({
      ...deriveFromKmH(convertMphToKmH(newValue)),
      mph: newValue,
    }),
    minutes: (newValue, current) => {
      // Entering minutes implies whole minutes: an empty seconds field
      // becomes "00" instead of staying blank.
      const seconds = current.seconds || (newValue ? "00" : "");
      return {
        ...deriveFromKmH(convertPaceToKm({ minutes: newValue, seconds })),
        minutes: newValue,
        seconds,
      };
    },
    seconds: (newValue, current) => ({
      ...deriveFromKmH(
        convertPaceToKm({ minutes: current.minutes, seconds: newValue }),
      ),
      minutes: current.minutes,
      seconds: newValue,
    }),
    mileMinutes: (newValue, current) => {
      const mileSeconds = current.mileSeconds || (newValue ? "00" : "");
      return {
        ...deriveFromKmH(
          convertMilesPaceToKmH({ minutes: newValue, seconds: mileSeconds }),
        ),
        mileMinutes: newValue,
        mileSeconds,
      };
    },
    mileSeconds: (newValue, current) => ({
      ...deriveFromKmH(
        convertMilesPaceToKmH({
          minutes: current.mileMinutes,
          seconds: newValue,
        }),
      ),
      mileMinutes: current.mileMinutes,
      mileSeconds: newValue,
    }),
  };

  const [state, setState] = useState(emptyState);
  const [formattedTimes, setFormattedTimes] = useState<formattedDistances[]>(
    [],
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [predictionBase, setPredictionBase] = useState<PredictionBase | null>(
    null,
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as PaceCalcUnits;
    setState((prevState) => calculateState[name](e.target.value, prevState));
  };

  // Normalize on blur: speeds get formatted, paces carry their overflow
  // upward (90 seconds becomes 01:30), then everything re-syncs.
  const normalizePacePair = (
    prevState: typeof emptyState,
    group: "km" | "miles",
  ): typeof emptyState => {
    const pair =
      group === "km"
        ? { minutes: prevState.minutes, seconds: prevState.seconds }
        : { minutes: prevState.mileMinutes, seconds: prevState.mileSeconds };
    const carried = carryTimeOverflow(pair, false);
    if (group === "km") {
      return {
        ...deriveFromKmH(convertPaceToKm(carried)),
        minutes: carried.minutes ?? "",
        seconds: carried.seconds ?? "",
      };
    }
    return {
      ...deriveFromKmH(convertMilesPaceToKmH(carried)),
      mileMinutes: carried.minutes ?? "",
      mileSeconds: carried.seconds ?? "",
    };
  };

  const doCalculations = (e: FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as PaceCalcUnits;
    setState((prevState) => {
      if (name === "km" || name === "mph") {
        return calculateState[name](
          unitFormater[name](prevState[name]),
          prevState,
        );
      }
      const group = name === "minutes" || name === "seconds" ? "km" : "miles";
      return normalizePacePair(prevState, group);
    });
  };

  const stepField = (fieldName: PaceCalcUnits, step: number) => {
    setState((prevState) => {
      const steppedValue = String(
        Math.max(0, Number(prevState[fieldName] || "0") + step),
      );
      if (fieldName === "km" || fieldName === "mph") {
        return calculateState[fieldName](
          unitFormater[fieldName](steppedValue),
          prevState,
        );
      }
      // Stepping a pace field: same cascade and carry as typing + blur, so
      // the seconds stepper rolls over into the next minute.
      const group =
        fieldName === "minutes" || fieldName === "seconds" ? "km" : "miles";
      const next = calculateState[fieldName](steppedValue, prevState);
      return normalizePacePair(next, group);
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

  const showKm = unitMode !== "miles";
  const showMiles = unitMode !== "km";

  const speedInputs = (
    <>
      {showKm && (
        <CountInput
          label={t.kmPerHour}
          name="km"
          placeholder={t.kmhUnit}
          value={state.km}
          onChange={onChange}
          onBlur={doCalculations}
          onIncrement={() => handleIncrement("km")}
          onDecrement={() => handleDecrement("km")}
        />
      )}
      {showMiles && (
        <CountInput
          label={t.milesPerHour}
          name="mph"
          placeholder="mph"
          value={state.mph}
          onChange={onChange}
          onBlur={doCalculations}
          onIncrement={() => handleIncrement("mph")}
          onDecrement={() => handleDecrement("mph")}
        />
      )}
    </>
  );

  return (
    <Wrap>
      {unitMode === "both" ? (
        <CountInputLayout>{speedInputs}</CountInputLayout>
      ) : (
        speedInputs
      )}
      {showKm && (
        <CountInputLayout>
          <CountInput
            onChange={onChange}
            onBlur={doCalculations}
            placeholder="00"
            min="0"
            max="59"
            name="minutes"
            label={t.minutesPerKm}
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
            label={t.secondsPerKm}
            value={state.seconds}
            onIncrement={() => handleIncrement("seconds")}
            onDecrement={() => handleDecrement("seconds")}
          />
        </CountInputLayout>
      )}
      {showMiles && (
        <CountInputLayout>
          <CountInput
            onChange={onChange}
            onBlur={doCalculations}
            placeholder="00"
            min="0"
            max="59"
            name="mileMinutes"
            label={t.minutesPerMile}
            value={state.mileMinutes}
            onIncrement={() => handleIncrement("mileMinutes")}
            onDecrement={() => handleDecrement("mileMinutes")}
          />
          <CountInput
            onChange={onChange}
            onBlur={doCalculations}
            placeholder="00"
            min="0"
            name="mileSeconds"
            label={t.secondsPerMile}
            value={state.mileSeconds}
            onIncrement={() => handleIncrement("mileSeconds")}
            onDecrement={() => handleDecrement("mileSeconds")}
          />
        </CountInputLayout>
      )}
      <ScrollableDistanceList>
        {formattedTimes.map((distance) => (
          <li key={distance.label}>
            <DistanceListItemButton
              type="button"
              disabled={!distance.formattedTime}
              onClick={() => openPredictions(distance)}
            >
              <RowLabel>{distanceLabel(distance.label)}</RowLabel>
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
        unitMode={unitMode}
      />
    </Wrap>
  );
};
