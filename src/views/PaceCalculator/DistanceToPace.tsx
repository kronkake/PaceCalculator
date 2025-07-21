import React, { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import { TextInput } from "../../components/TextInput";
import { Select } from "../../components/Select";
import styled from "styled-components";
import { fancyTimeFormat } from "../../utils/paceFormats";
import { distances } from "../../units/units";

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

// Helper function to convert time string (HH:MM:SS or MM:SS) to seconds
const convertTimeToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0;

  const parts = timeStr.split(":").map((part) => parseInt(part, 10) || 0);

  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // Just seconds
    return parts[0];
  }

  return 0;
};

// Calculate pace per km from total time and distance
const calculatePaceFromTimeAndDistance = (timeStr: string, distanceKm: number): string => {
  if (!timeStr || !distanceKm) return "";

  const totalSeconds = convertTimeToSeconds(timeStr);

  const pacePerKmSeconds = totalSeconds / distanceKm;
  return fancyTimeFormat(pacePerKmSeconds);
};

// Calculate km/h from total time and distance
const calculateKmPerHour = (timeStr: string, distanceKm: number): string => {
  if (!timeStr || !distanceKm) return "";

  const totalSeconds = convertTimeToSeconds(timeStr);

  const hours = totalSeconds / 3600;
  const kmPerHour = distanceKm / hours;

  return kmPerHour.toFixed(2);
};

type DistanceToPaceUnits = "time" | "distance";

interface CalculatedResults {
  pacePerKm: string;
  kmPerHour: string;
}

export const DistanceToPace = () => {
  const initialState: Record<DistanceToPaceUnits, string> = {
    time: "",
    distance: "",
  };

  // Create options for the select from distances
  const distanceOptions = distances.map((distance) => ({
    value: distance.km.toString(),
    label: `${distance.label} (${distance.km}km)`,
  }));

  const calculateState: Record<DistanceToPaceUnits, (newValue: string) => CalculatedResults> = {
    time: (newValue: string) => {
      const distanceNum = parseFloat(state.distance);
      return {
        pacePerKm: calculatePaceFromTimeAndDistance(newValue, distanceNum),
        kmPerHour: calculateKmPerHour(newValue, distanceNum),
      };
    },
    distance: (newValue: string) => {
      const distanceNum = parseFloat(newValue);
      return {
        pacePerKm: calculatePaceFromTimeAndDistance(state.time, distanceNum),
        kmPerHour: calculateKmPerHour(state.time, distanceNum),
      };
    },
  };

  const unitFormater: Record<DistanceToPaceUnits, (newValue: string) => string> = {
    time: (value: string) => {
      return value;
    },
    distance: (value: string) => {
      return value;
    },
  };

  const [state, setState] = useState(initialState);
  const [results, setResults] = useState<CalculatedResults>({
    pacePerKm: "",
    kmPerHour: "",
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const targetName = e.target.name as keyof typeof initialState;

    setState({
      ...state,
      [targetName]: e.target.value,
    });
  };

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const targetName = e.target.name as keyof typeof initialState;

    setState({
      ...state,
      [targetName]: e.target.value,
    });
  };

  const calculate = (e: FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof typeof initialState;
    const formattedValue = unitFormater[name](e.target.value);
    if (!formattedValue) {
      setResults({ pacePerKm: "", kmPerHour: "" });
      return;
    }

    const newResults = calculateState[name](formattedValue);
    setResults(newResults);
  };

  const doSelectCalculations = (e: ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name as keyof typeof initialState;
    const formattedValue = unitFormater[name](e.target.value);
    if (!formattedValue) {
      setResults({ pacePerKm: "", kmPerHour: "" });
      return;
    }

    const newResults = calculateState[name](formattedValue);
    setResults(newResults);
  };

  useEffect(() => {
    if (state.time && state.distance) {
      const distanceNum = parseFloat(state.distance);
      setResults({
        pacePerKm: calculatePaceFromTimeAndDistance(state.time, distanceNum),
        kmPerHour: calculateKmPerHour(state.time, distanceNum),
      });
    } else {
      setResults({ pacePerKm: "", kmPerHour: "" });
    }
  }, [state.time, state.distance]);

  return (
    <Wrap>
      <Label>
        Tid (HH:MM:SS eller MM:SS)
        <TextInput placeholder="1:23:45 eller 23:45" name="time" value={state.time} onChange={onChange} onBlur={calculate} />
      </Label>

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
              onChange={onSelectChange}
              onBlur={doSelectCalculations}
              options={distanceOptions}
            />
          </InputWrapper>
        </InputGroup>
      </Label>

      <ResultsContainer>
        <ResultItem>
          <ResultLabel>Pace per kilometer:</ResultLabel>
          <ResultValue>{results.pacePerKm}</ResultValue>
        </ResultItem>
        <ResultItem>
          <ResultLabel>Kilometer per time:</ResultLabel>
          <ResultValue>{results.kmPerHour} km/t</ResultValue>
        </ResultItem>
      </ResultsContainer>
    </Wrap>
  );
};
