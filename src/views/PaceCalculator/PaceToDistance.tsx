import React, { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import styled from "styled-components";
import { PaceToDistanceUnits as PaceCalcUnits } from "../../types/types";
import { formatTime, unitFormater } from "../../utils/paceFormats";
import { distances } from "../../units/units";
import {
  convertKmToPace,
  convertPaceToKm,
  convertDistanceToTimeBasedOnPace,
} from "../../utils/paceConversation";
import { CountInput } from "../../components/CountInput";
import { CountInputLayout } from "../../layout/CountLayout";
import { DistanceList, DistanceListItem } from "../../components/ListItems";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
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
    minutes: (newValue, current) => ({
      minutes: newValue,
      km: convertPaceToKm({ minutes: newValue, seconds: current.seconds }),
    }),
    seconds: (newValue, current) => ({
      seconds: newValue,
      km: convertPaceToKm({ minutes: current.minutes, seconds: newValue }),
    }),
  };

  const [state, setState] = useState(initialState);
  const [formattedTimes, setFormattedTimes] = useState<formattedDistances[]>(
    [],
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

  // On blur the edited field gets formatted/clamped, and the derived fields
  // are recalculated from the clamped value.
  const doCalculations = (e: FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as PaceCalcUnits;
    setState((prevState) => ({
      ...prevState,
      ...calculateState[name](unitFormater[name](prevState[name]), prevState),
    }));
  };

  const stepField = (fieldName: PaceCalcUnits, step: number) => {
    setState((prevState) => {
      const steppedValue = Math.max(
        0,
        Number(prevState[fieldName] || "0") + step,
      );
      return {
        ...prevState,
        ...calculateState[fieldName](
          unitFormater[fieldName](String(steppedValue)),
          prevState,
        ),
      };
    });
  };

  const handleIncrement = (fieldName: PaceCalcUnits) => stepField(fieldName, 1);
  const handleDecrement = (fieldName: PaceCalcUnits) =>
    stepField(fieldName, -1);

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
          max="59"
          name="seconds"
          label="Sekunder pr kilometer"
          value={state.seconds}
          onIncrement={() => handleIncrement("seconds")}
          onDecrement={() => handleDecrement("seconds")}
        />
      </CountInputLayout>
      <DistanceList>
        {formattedTimes.map(({ label, formattedTime }) => (
          <DistanceListItem key={`${label}-${formattedTime}`}>
            {label}: {formattedTime}
          </DistanceListItem>
        ))}
      </DistanceList>
    </Wrap>
  );
};
