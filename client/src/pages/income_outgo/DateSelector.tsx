import React from "react";
import styled from "styled-components";
import { SvgIcon } from "@mui/material";
import type { Moment } from "moment";
import ArrowBackIosOutlinedIcon from "@mui/icons-material/ArrowBackIosOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";

interface DateSelectorProps {
  currentDate: Moment;
  onDateChange: (date: Moment) => void;
  onCalendarOpen: () => void;
}

const DateContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const DateDisplay = styled.div`
  cursor: pointer;
  padding: 0.5rem;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 0.25rem;
  }
`;

const ArrowButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 0.25rem;
  }
`;

const DateSelector: React.FC<DateSelectorProps> = ({
  currentDate,
  onDateChange,
  onCalendarOpen,
}) => {
  return (
    <DateContainer>
      <ArrowButton
        onClick={() => {
          onDateChange(currentDate.clone().subtract(1, "month"));
        }}
      >
        <SvgIcon
          component={ArrowBackIosOutlinedIcon}
          sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
        />
      </ArrowButton>
      <DateDisplay onClick={onCalendarOpen}>
        {currentDate.format("YYYY-MM")}
      </DateDisplay>
      <ArrowButton
        onClick={() => {
          onDateChange(currentDate.clone().add(1, "month"));
        }}
      >
        <SvgIcon
          component={ArrowForwardIosOutlinedIcon}
          sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
        />
      </ArrowButton>
    </DateContainer>
  );
};

export default DateSelector;
