import * as React from "react";
import styled from "styled-components";

interface SearchParamerersProps {
  lookaheadOptions: number[];
  lookahead: number;
  onLookaheadChange: (lookahead: number) => void;
}

const RadioSelect = styled.div`
  display: inline-flex;
  flex-direction: row;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  background-color: whitesmoke;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
  grid-area: paramsbar;

  & div {
    display: flex;
    align-items: center;
    font-weight: bold;
    overflow: hidden;
    color: rgba(0, 0, 0, 0.6);
    padding: 8px;
    cursor: pointer;
  }

  & .minute-selected {
    color: rgba(0, 0, 0, 0.9);
    background-color: #fff;
  }
`;

export const SearchParameters = (props: SearchParamerersProps) => {
  const { lookaheadOptions } = props;

  const handleClick = (e) => {
    const newValue = parseInt(e.target.getAttribute("data-value"));
    if (props.lookahead !== newValue) {
      props.onLookaheadChange(newValue);
    }
  };

  return (
    <div>
      <h4>In the next</h4>
      <RadioSelect>
        {lookaheadOptions.map((o, i) => {
          return (
            <div
              key={i}
              className={props.lookahead === o ? "minute-selected" : ""}
              onClick={handleClick}
              data-value={o}
            >
              {o} mins
            </div>
          );
        })}
      </RadioSelect>
    </div>
  );
};
