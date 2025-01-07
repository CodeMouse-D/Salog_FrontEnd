import React from "react";
import { styled } from "styled-components";

interface MonthlyOutgoType {
  monthlyTotal: number;
  tags: Array<{
    tagName: string;
    tagSum: number;
  }>;
}

interface YearlySpendingProps {
  monthlyData: MonthlyOutgoType[];
}

const YearlySpending: React.FC<YearlySpendingProps> = ({ monthlyData }) => {
  // 12개월 데이터를 역순으로 정렬 (최근 달이 위로)
  const sortedMonths = [...Array(12)]
    .map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - index);
      return {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        spending: monthlyData?.[11 - index]?.monthlyTotal || 0,
      };
    })
    .reverse();

  // 최대 지출액을 기준으로 막대 길이 계산
  const maxSpending = Math.max(...sortedMonths.map((m) => m.spending));

  return (
    <Container>
      <h5>최근 12개월 지출 추이</h5>
      <ChartContainer>
        {sortedMonths.map((data, index) => (
          <ChartRow key={index}>
            <MonthLabel>
              {`${data.year}.${String(data.month).padStart(2, "0")}`}
            </MonthLabel>
            <BarContainer>
              <Bar
                width={`${(data.spending / maxSpending) * 100}%`}
                isCurrentMonth={index === sortedMonths.length - 1}
              >
                <BarContent>
                  <span>{data.spending.toLocaleString()}원</span>
                </BarContent>
              </Bar>
            </BarContainer>
          </ChartRow>
        ))}
      </ChartContainer>
      <Legend>
        <LegendItem>
          <LegendColor isCurrentMonth={true} />
          <span>이번 달</span>
        </LegendItem>
        <LegendItem>
          <LegendColor isCurrentMonth={false} />
          <span>이전 달</span>
        </LegendItem>
      </Legend>
    </Container>
  );
};

const Container = styled.div`
  width: 50%;
  padding: 1.5rem;
  height: 100%;
  border-right: 1px solid #c2c2c2;

  h5 {
    font-size: 1.3rem;
    font-weight: 400;
    margin-bottom: 1.5rem;
  }
`;

const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  height: calc(100% - 6rem);
  overflow-y: auto;
`;

const ChartRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 2.4rem;
`;

const MonthLabel = styled.div`
  min-width: 4.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const BarContainer = styled.div`
  flex: 1;
  height: 2rem;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const Bar = styled.div<{ width: string; isCurrentMonth: boolean }>`
  height: 100%;
  width: ${(props) => props.width};
  background-color: ${(props) =>
    props.isCurrentMonth ? props.theme.COLORS.LIGHT_RED : "#bfbbbb"};
  border-radius: 4px;
  transition: width 1s ease-in-out;
  position: relative;
  min-width: 4rem;
`;

const BarContent = styled.div`
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  font-size: 0.9rem;
  white-space: nowrap;
`;

const Legend = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const LegendColor = styled.div<{ isCurrentMonth: boolean }>`
  width: 1rem;
  height: 1rem;
  background-color: ${(props) =>
    props.isCurrentMonth ? props.theme.COLORS.LIGHT_RED : "#bfbbbb"};
  border-radius: 2px;
`;

export default YearlySpending;
