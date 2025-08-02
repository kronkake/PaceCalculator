import React, { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import { Select } from "../../components/Select";
import styled from "styled-components";
import { formatTime, unitFormater } from "../../utils/paceFormats";
import { distances } from "../../units/units";
import { CountInput } from "../../components/CountInput";
import { CountInputLayout } from "../../layout/CountLayout";
import { DistanceToPaceUnits } from "../../types/types";
import {
  calculateRequiredSpeed,
  convertKmToPace,
} from "../../utils/paceConversation";
import { DistanceList, DistanceListItem } from "../../components/ListItems";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const Label = styled.label`
  color: #746d69;
  font-size: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const InputWrapper = styled.div`
  flex: 1;
`;

const OrText = styled.span`
  color: #746d69;
  font-size: 0.9rem;
  padding: 0 8px;
  align-self: center;
`;

interface CalculatedResults {
  pacePerKm: string;
  kmPerHour: string;
}

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

  const calculateState: Record<
    string,
    (newValue: string) => Partial<typeof initialState>
  > = {
    hours: (newValue: string) => {
      return { hours: newValue };
    },
    minutes: (newValue: string) => {
      return { minutes: newValue };
    },
    seconds: (newValue: string) => {
      return { seconds: newValue };
    },
    distance: (newValue: string) => {
      return { distance: newValue };
    },
  };

  const [state, setState] = useState(initialState);
  const [results, setResults] = useState<CalculatedResults>({
    pacePerKm: "",
    kmPerHour: "",
  });

  const updateStateValue = (
    fieldName: DistanceToPaceUnits,
    newValue: string
  ) => {
    const formattedValue = unitFormater[fieldName](newValue);
    const newState = calculateState[fieldName](formattedValue);

    setState((prevState) => ({ ...prevState, ...newState }));
  };

  const getFormattedAndCalculatedState = (
    fieldName: DistanceToPaceUnits,
    batchedValue: string
  ) => {
    const formattedValue = unitFormater[fieldName](batchedValue);
    const newState = calculateState[fieldName](formattedValue);
    return newState;
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const targetName = e.target.name as keyof typeof initialState;

    setState({
      ...state,
      [targetName]: e.target.value,
    });
  };

  const calculate = (e: FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof typeof initialState;
    const currentValue = state[name];
    const newValue = e.target.value;

    // Only trigger calculations if the value actually changed
    if (currentValue !== newValue) {
      setState((prevState) => ({
        ...prevState,
        ...getFormattedAndCalculatedState(name, newValue),
      }));
    }
  };

  const doSelectCalculations = (e: ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name as keyof typeof initialState;
    const formattedValue = unitFormater[name](e.target.value);

    const newState = calculateState[name](formattedValue);
    setState((prevState) => ({ ...prevState, ...newState }));
  };

  const handleIncrement = (fieldName: DistanceToPaceUnits) => {
    setState((prevState) => {
      const updatedValue = String(Number(prevState[fieldName] || "0") + 1);
      return {
        ...prevState,
        ...getFormattedAndCalculatedState(fieldName, updatedValue),
      };
    });
  };

  const handleDecrement = (fieldName: DistanceToPaceUnits) => {
    setState((prevState) => {
      const updatedValue = String(
        Math.max(0, Number(prevState[fieldName] || "0") - 1)
      );
      return {
        ...prevState,
        ...getFormattedAndCalculatedState(fieldName, updatedValue),
      };
    });
  };

  useEffect(() => {
    if ((!state.hours || !state.minutes || !state.seconds) && !state.distance) {
      setResults({
        pacePerKm: "",
        kmPerHour: "",
      });
      return;
    }
    const requiredSpeedKmPerHour = calculateRequiredSpeed(
      parseFloat(state.distance ?? 0),
      {
        hours: state.hours,
        minutes: state.minutes,
        seconds: state.seconds,
      }
    );
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
              placeholder="Velg distanse"
              name="distance"
              onChange={onChange}
              onBlur={doSelectCalculations}
              options={distanceOptions}
            />
          </InputWrapper>
        </InputGroup>
      </Label>

      <DistanceList>
        <DistanceListItem>
          Minutter pr kilometer: {results.pacePerKm}
        </DistanceListItem>
        <DistanceListItem>
          Kilometer i timen:{" "}
          {results.kmPerHour && Number(results.kmPerHour) > 0
            ? `${results.kmPerHour} km/t`
            : ""}
        </DistanceListItem>
      </DistanceList>
    </Wrap>
  );
};
