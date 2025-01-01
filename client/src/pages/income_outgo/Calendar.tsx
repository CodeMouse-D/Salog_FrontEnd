import React, { useState } from "react";
import moment from "moment";
import type { Moment } from "moment";
import styled from "styled-components";

interface CalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (startDate: Moment, endDate: Moment) => void;
  currentDate: Moment;
}

interface DayButtonProps {
  isCurrentMonth: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isToday: boolean;
  isHovered: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentDate,
}) => {
  const [viewDate, setViewDate] = useState<Moment>(moment(currentDate));
  const [startDate, setStartDate] = useState<Moment | null>(null);
  const [endDate, setEndDate] = useState<Moment | null>(null);
  const [hoverDate, setHoverDate] = useState<Moment | null>(null);
  const today = moment();

  const handleDateClick = (date: Moment) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date.isBefore(startDate)) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
    }
  };

  const handleDateHover = (date: Moment) => {
    if (startDate && !endDate) {
      setHoverDate(date);
    }
  };

  const handleMouseLeave = () => {
    setHoverDate(null);
  };

  const isInRange = (date: Moment): boolean => {
    if (startDate && endDate) {
      return date.isBetween(startDate, endDate, "day", "[]");
    }
    if (startDate && hoverDate) {
      const start = moment.min(startDate, hoverDate);
      const end = moment.max(startDate, hoverDate);
      return date.isBetween(start, end, "day", "[]");
    }
    return false;
  };

  const generateCalendar = (baseDate: Moment): Array<Moment | null> => {
    const firstDay = baseDate.clone().startOf("month");
    const lastDay = baseDate.clone().endOf("month");
    const days: Array<Moment | null> = [];
    const day = firstDay.clone();

    // 첫째 날의 요일만큼 빈 셀 추가
    const firstDayOfWeek = firstDay.day();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // 해당 월의 날짜들 추가
    while (day.isSameOrBefore(lastDay, "day")) {
      days.push(day.clone());
      day.add(1, "day");
    }

    // 마지막 주의 남은 칸을 빈 셀로 채움
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push(null);
      }
    }

    return days;
  };

  const nextMonth = viewDate.clone().add(1, "month");
  // const showNextMonth = generateCalendar(nextMonth);

  if (!isOpen) return null;

  return (
    <Modal>
      <CalendarContainer>
        <MonthSelector>
          <NavigationButton
            onClick={() => setViewDate(viewDate.clone().subtract(1, "month"))}
          >
            ←
          </NavigationButton>
          <MonthGroup>
            <MonthTitle>{viewDate.format("YYYY년 M월")}</MonthTitle>
            <MonthTitle>{nextMonth.format("YYYY년 M월")}</MonthTitle>
          </MonthGroup>
          <NavigationButton
            onClick={() => setViewDate(viewDate.clone().add(1, "month"))}
          >
            →
          </NavigationButton>
        </MonthSelector>

        <MonthsContainer>
          <MonthContainer>
            <WeekdayGrid>
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <Weekday key={day}>{day}</Weekday>
              ))}
            </WeekdayGrid>
            <DayGrid onMouseLeave={handleMouseLeave}>
              {generateCalendar(viewDate).map((date, index) => (
                <DayCell key={index}>
                  {date && (
                    <DayButton
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => handleDateHover(date)}
                      isCurrentMonth={true}
                      isSelected={
                        date.isSame(startDate, "day") ||
                        date.isSame(endDate, "day")
                      }
                      isInRange={isInRange(date)}
                      isRangeStart={startDate?.isSame(date, "day") ?? false}
                      isRangeEnd={endDate?.isSame(date, "day") ?? false}
                      isToday={date.isSame(today, "day")}
                      isHovered={hoverDate?.isSame(date, "day") ?? false}
                    >
                      <DayContent>{date.format("D")}</DayContent>
                    </DayButton>
                  )}
                </DayCell>
              ))}
            </DayGrid>
          </MonthContainer>

          <MonthContainer>
            <WeekdayGrid>
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <Weekday key={`next-${day}`}>{day}</Weekday>
              ))}
            </WeekdayGrid>
            <DayGrid onMouseLeave={handleMouseLeave}>
              {generateCalendar(nextMonth).map((date, index) => (
                <DayCell key={index}>
                  {date && (
                    <DayButton
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => handleDateHover(date)}
                      isCurrentMonth={true}
                      isSelected={
                        date.isSame(startDate, "day") ||
                        date.isSame(endDate, "day")
                      }
                      isInRange={isInRange(date)}
                      isRangeStart={startDate?.isSame(date, "day") ?? false}
                      isRangeEnd={endDate?.isSame(date, "day") ?? false}
                      isToday={date.isSame(today, "day")}
                      isHovered={hoverDate?.isSame(date, "day") ?? false}
                    >
                      <DayContent>{date.format("D")}</DayContent>
                    </DayButton>
                  )}
                </DayCell>
              ))}
            </DayGrid>
          </MonthContainer>
        </MonthsContainer>

        <Footer>
          <Button className="cancel" onClick={onClose}>
            취소
          </Button>
          <Button
            className="confirm"
            onClick={() => {
              if (startDate && endDate) {
                onSelect(startDate, endDate);
                onClose();
              }
            }}
            disabled={!startDate || !endDate}
          >
            확인
          </Button>
        </Footer>
      </CalendarContainer>
    </Modal>
  );
};

export default Calendar;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const CalendarContainer = styled.div`
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  width: 700px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const MonthSelector = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const MonthGroup = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const MonthsContainer = styled.div`
  display: flex;
  gap: 2rem;
`;

const MonthContainer = styled.div`
  flex: 1;
`;

const MonthTitle = styled.h2`
  font-size: 1.45rem;
  font-weight: 600;
  color: #222222;
  margin: 0;
`;

const NavigationButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dddddd;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #222222;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const WeekdayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.5rem;
`;

const Weekday = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #717171;
  padding: 0.5rem;
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  border-collapse: collapse;
`;

const DayButton = styled.button<DayButtonProps>`
  aspect-ratio: 1;
  width: 100%;
  border: none;
  background: none;
  font-size: 1.3rem;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0; // 패딩 제거
  margin: 0; // 마진 제거
  outline: none; // 아웃라인 제거

  ${({
    isCurrentMonth,
    isSelected,
    isInRange,
    isRangeStart,
    isRangeEnd,
    isToday,
    isHovered,
  }) => `
    color: ${isCurrentMonth ? "#222222" : "#dddddd"};
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: ${isInRange || isHovered ? "#f7f7f7" : "transparent"};
      border-radius: ${
        isRangeStart ? "50% 0 0 50%" : isRangeEnd ? "0 50% 50% 0" : "0px"
      };
      z-index: 0;
      margin: 0; // 마진 제거
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 4px;
      left: 4px;
      right: 4px;
      bottom: 4px;
      background-color: ${
        isSelected || isRangeStart || isRangeEnd ? "#222222" : "transparent"
      };
      border-radius: ${isRangeStart ? "50%" : isRangeEnd ? "50%" : "50%"};
      z-index: 1;
      margin: 0; // 마진 제거
    }
    
    ${
      (isSelected || isRangeStart || isRangeEnd) &&
      `
      color: white;
      z-index: 2;
    `
    }
    
    ${
      isToday &&
      !isSelected &&
      !isInRange &&
      !isRangeStart &&
      !isRangeEnd &&
      `
      &::after {
        border: 1px solid #222222;
        background-color: transparent;
      }
    `
    }
    
    &:hover {
      &::after {
        background-color: ${
          isSelected || isRangeStart || isRangeEnd ? "#222222" : "transparent"
        };
      }
    }
  `}
`;

const DayContent = styled.span`
  position: relative;
  z-index: 2;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const DayCell = styled.div`
  aspect-ratio: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Footer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &.confirm {
    background-color: #222222;
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background-color: #000000;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &.cancel {
    background-color: white;
    color: #222222;
    border: 1px solid #dddddd;

    &:hover {
      border-color: #222222;
    }
  }
`;
