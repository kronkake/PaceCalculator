import React from "react";
import styled from "styled-components";
import { PaceCalculator } from "./views/PaceCalculator";

const Main = styled.main`
  background: white;
  font-size: 1.5rem;
  display: flex;
  justify-content: center;
`;

function App() {
  return (
    <>
      <Main>
        <PaceCalculator />
      </Main>
    </>
  );
}

export default App;
