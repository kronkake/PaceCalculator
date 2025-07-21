import { TextInput } from "../../components/TextInput";
import React, { ChangeEvent, FocusEvent, useEffect, useState } from "react";
import styled from "styled-components";
import { PaceCalcUnits } from "../../types/types";
import { unitFormater } from "../../utils/paceFormats";
import { distances } from "../../units/units";
import { convertKmToPace, convertPaceToKm, convertDistanceToTimeBasedOnPace } from "../../utils/paceConversation";

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
    pace: "",
    km: "",
  };

  const calculateState: Record<PaceCalcUnits, (newValue: string) => typeof initialState> = {
    km: (newValue: string) => {
      return { km: unitFormater.km(newValue), pace: convertKmToPace(newValue) };
    },
    pace: (newValue: string) => {
      return { pace: unitFormater.pace(newValue), km: convertPaceToKm(newValue) };
    },
  };

  const [state, setState] = useState(initialState);
  const [formattedTimes, setFormattedTimes] = useState<formattedDistances[]>([]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const targetName = e.target.name as keyof typeof initialState;

    setState({
      ...state,
      [targetName]: e.target.value,
    });
  };

  const doCalculations = (e: FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof typeof initialState;
    const formattedValue = unitFormater[name](e.target.value);
    if (!formattedValue) return;

    setState(calculateState[name](formattedValue));
  };

  useEffect(() => {
    setFormattedTimes(
      distances.map((distance) => ({ ...distance, formattedTime: convertDistanceToTimeBasedOnPace(state.pace, distance.km) }))
    );
  }, [state.pace]);

  return (
    <Wrap>
      <Label>
        Kilometer i timen
        <TextInput placeholder="km/t" name="km" value={state.km} onChange={onChange} onBlur={doCalculations} />
      </Label>
      <Label>
        Minutter pr km
        <TextInput placeholder="MM:SS" name="pace" value={state.pace} onChange={onChange} onBlur={doCalculations} />
      </Label>
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
