import React, { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import { TextInput } from "../../components/TextInput";
import { Select } from "../../components/Select";
import styled from "styled-components";
import { unitFormater } from "../../utils/paceFormats";
import { distances } from "../../units/units";
import { CountInput } from "../../components/CountInput";
import { CountInputLayout } from "../../layout/CountLayout";
import { DistanceToPaceUnits } from "../../types/types";
import {
  calculateRequiredSpeed,
  convertKmToPace,
} from "../../utils/paceConversation";

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

const ResultsContainer = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding: 0;
  list-style: none;
`;

const ResultItem = styled.li`
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 5px;
  border-left: 4px solid #6200ee;
`;

const ResultLabel = styled.span`
  font-weight: 500;
  color: #333;
`;

const ResultValue = styled.span`
  font-size: 1.1rem;
  color: #6200ee;
  margin-left: 8px;
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
      updateStateValue(name, newValue);
    }
  };

  const doSelectCalculations = (e: ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name as keyof typeof initialState;
    const formattedValue = unitFormater[name](e.target.value);

    const newState = calculateState[name](formattedValue);
    setState((prevState) => ({ ...prevState, ...newState }));
  };

  const handleIncrement = (fieldName: DistanceToPaceUnits) => {
    const newValue = Number(state[fieldName] || "0") + 1;
    updateStateValue(fieldName, newValue.toString());
  };

  const handleDecrement = (fieldName: DistanceToPaceUnits) => {
    const newValue = Math.max(0, Number(state[fieldName] || "0") - 1);
    updateStateValue(fieldName, newValue.toString());
  };

  useEffect(() => {
    const requiredSpeedKmPerHour = calculateRequiredSpeed(
      parseFloat(state.distance ?? 0),
      {
        hours: state.hours,
        minutes: state.minutes,
        seconds: state.seconds,
      }
    );
    const paceUnits = convertKmToPace(requiredSpeedKmPerHour);
    setResults({
      pacePerKm: `${paceUnits.hours}:${paceUnits.minutes}:${paceUnits.seconds}`,
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
        Distanse (km)
        <InputGroup>
          <InputWrapper>
            <TextInput
              placeholder="42.195"
              name="distance"
              value={state.distance}
              onChange={onChange}
              onBlur={calculate}
              type="number"
              step="1"
            />
          </InputWrapper>
          <OrText>eller</OrText>
          <InputWrapper>
            <Select
              placeholder="Velg distanse"
              name="distance"
              value={state.distance}
              onChange={onChange}
              onBlur={doSelectCalculations}
              options={distanceOptions}
            />
          </InputWrapper>
        </InputGroup>
      </Label>

      <ResultsContainer>
        <ResultItem>
          <ResultLabel>Minutter pr kilometer:</ResultLabel>
          <ResultValue>{results.pacePerKm}</ResultValue>
        </ResultItem>
        <ResultItem>
          <ResultLabel>Kilometer i timen:</ResultLabel>
          <ResultValue>{results.kmPerHour} km/t</ResultValue>
        </ResultItem>
      </ResultsContainer>
    </Wrap>
  );
};
