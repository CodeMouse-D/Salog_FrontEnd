import { SvgIcon } from "@mui/material";
import type { Moment } from "moment";
import { useState } from "react";
import ArrowBackIosOutlinedIcon from "@mui/icons-material/ArrowBackIosOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import Calendar from "./Calendar";
import { styled } from "styled-components";

interface DateRange {
  startDate: Moment | null;
  endDate: Moment | null;
}

interface DateSelectorProps {
  getMoment: Moment;
  setMoment: (moment: Moment) => void;
  onDateRangeSelect?: (startDate: Moment, endDate: Moment) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  getMoment,
  setMoment,
  onDateRangeSelect,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  const handleDateSelect = (startDate: Moment, endDate: Moment) => {
    if (startDate.isSame(endDate, "day")) {
      // Single date selection - set the month view
      setSelectedRange({ startDate: null, endDate: null });
      setMoment(startDate);
    } else {
      // Date range selection
      setSelectedRange({ startDate, endDate });

      // Don't update the month view when selecting a range
      if (onDateRangeSelect) {
        onDateRangeSelect(
          startDate.startOf("day"), // Set to start of day (00:00:00)
          endDate.endOf("day") // Set to end of day (23:59:59)
        );
      }
    }
    setIsCalendarOpen(false);
  };

  const handleMonthNavigation = (direction: "prev" | "next") => {
    // Clear date range when navigating months
    setSelectedRange({ startDate: null, endDate: null });
    setMoment(
      direction === "prev"
        ? getMoment.clone().subtract(1, "month")
        : getMoment.clone().add(1, "month")
    );
  };

  return (
    <>
      <Container className="date__div">
        <button onClick={() => handleMonthNavigation("prev")}>
          <SvgIcon
            component={ArrowBackIosOutlinedIcon}
            sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
          />
        </button>

        <DateDiv onClick={() => setIsCalendarOpen(true)}>
          {selectedRange.startDate && selectedRange.endDate
            ? `${selectedRange.startDate.format(
                "YYYY-MM-DD"
              )} ~ ${selectedRange.endDate.format("YYYY-MM-DD")}`
            : getMoment.format("YYYY-MM")}
          <SvgIcon
            component={CalendarTodayOutlinedIcon}
            sx={{ fontSize: "1.4rem", color: "#464656" }}
          />
        </DateDiv>

        <button onClick={() => handleMonthNavigation("next")}>
          <SvgIcon
            component={ArrowForwardIosOutlinedIcon}
            sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
          />
        </button>
      </Container>
      <Calendar
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSelect={handleDateSelect}
        currentDate={getMoment}
      />
    </>
  );
};

export default DateSelector;

const Container = styled.div`
  .date__div {
    display: flex;
    width: fit-content;

    button {
      border: 1px solid #bebebe;
      padding: 0.6rem;
      color: #464656;

      &:first-child {
        border-radius: 8px 0px 0px 8px;
      }
      &:last-child {
        border-radius: 0px 8px 8px 0px;
      }
    }

    div {
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 10rem;
      border-top: 1px solid #bebebe;
      border-bottom: 1px solid #bebebe;
      padding: 0.6rem;
      font-size: 1.6rem;
      font-weight: 600;
      color: #464656;
    }
  }
`;

const DateDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  min-width: 10rem;
  max-width: fit-content;
  width: auto;
  border-top: 1px solid #bebebe;
  border-bottom: 1px solid #bebebe;
  padding: 0.6rem 1.2rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: #464656;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: #f5f5f5;
  }
`;
