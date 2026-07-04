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
  convertPaceToSeconds,
} from "../../utils/paceConversation";
import { DistanceList, DistanceListItem } from "../../components/ListItems";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const Label = styled.div`
  color: var(--color-text-muted);
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
  color: var(--color-text-muted);
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

  const [state, setState] = useState(initialState);
  const [results, setResults] = useState<CalculatedResults>({
    pacePerKm: "",
    kmPerHour: "",
  });

  // The results effect below recalculates on every state change, so typing
  // is already live; blur only formats/clamps the field the user left.
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const targetName = e.target.name as keyof typeof initialState;

    setState((prevState) => ({
      ...prevState,
      [targetName]: e.target.value,
    }));
  };

  const calculate = (e: FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof typeof initialState;
    setState((prevState) => ({
      ...prevState,
      [name]: unitFormater[name](prevState[name]),
    }));
  };

  const stepField = (fieldName: DistanceToPaceUnits, step: number) => {
    setState((prevState) => {
      const steppedValue = Math.max(
        0,
        Number(prevState[fieldName] || "0") + step,
      );
      return {
        ...prevState,
        [fieldName]: unitFormater[fieldName](String(steppedValue)),
      };
    });
  };

  const handleIncrement = (fieldName: DistanceToPaceUnits) =>
    stepField(fieldName, 1);

  const handleDecrement = (fieldName: DistanceToPaceUnits) =>
    stepField(fieldName, -1);

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
              placeholder="Velg distanse"
              name="distance"
              value={state.distance}
              onChange={onChange}
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
          {results.kmPerHour ? `${results.kmPerHour} km/t` : ""}
        </DistanceListItem>
      </DistanceList>
    </Wrap>
  );
};
