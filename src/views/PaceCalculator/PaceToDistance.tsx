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

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const DistanceList = styled.ol`
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 7.5px;
`;

const DistanceListItem = styled.li`
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 5px;
  border-left: 4px solid #6200ee;
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

  const calculateState: Record<
    string,
    (newValue: string) => Partial<typeof initialState>
  > = {
    km: (newValue: string) => {
      const pace = convertKmToPace(newValue);
      const { minutes, seconds } = pace;
      return { km: unitFormater.km(newValue), minutes, seconds };
    },
    minutes: (newValue: string) => {
      return {
        minutes: newValue,
        km: convertPaceToKm({
          minutes: newValue,
          seconds: state.seconds,
        }),
      };
    },
    seconds: (newValue: string) => {
      return {
        seconds: newValue,
        km: convertPaceToKm({
          minutes: state.minutes,
          seconds: newValue,
        }),
      };
    },
  };

  const [state, setState] = useState(initialState);
  const [formattedTimes, setFormattedTimes] = useState<formattedDistances[]>(
    []
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const targetName = e.target.name as keyof typeof initialState;

    setState({
      ...state,
      [targetName]: e.target.value,
    });
  };

  const updateStateValue = (fieldName: PaceCalcUnits, newValue: string) => {
    const formattedValue = unitFormater[fieldName](newValue);
    const newState = calculateState[fieldName](formattedValue);

    setState((prevState) => ({ ...prevState, ...newState }));
  };

  const doCalculations = (e: FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof typeof initialState;
    const currentValue = state[name];
    const newValue = e.target.value;

    // Only trigger calculations if the value actually changed
    if (currentValue !== newValue) {
      updateStateValue(name, newValue);
    }
  };

  const handleIncrement = (fieldName: PaceCalcUnits) => {
    const newValue = Number(state[fieldName] || "0") + 1;

    updateStateValue(fieldName, newValue.toString());
  };

  const handleDecrement = (fieldName: PaceCalcUnits) => {
    const newValue = Number(state[fieldName] || "0") - 1;
    updateStateValue(fieldName, newValue.toString());
  };

  useEffect(() => {
    setFormattedTimes(
      distances.map((distance) => {
        const time = convertDistanceToTimeBasedOnPace(
          {
            minutes: state.minutes,
            seconds: state.seconds,
          },
          distance.km
        );
        return {
          ...distance,
          formattedTime: formatTime(time) || "",
        };
      })
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
