import axios from "axios";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { v4 as uuidv4 } from "uuid";

interface fixedOutgoType {
	fixedOutgo: number;
	date: string;
	money: number;
	outgoName: string;
}

interface fixedIncomeType {
	fixedIncome: number;
	date: string;
	money: number;
	incomeName: string;
}

const Schedule = () => {
	const [fixedOutgo, setFixedOutgo] = useState<fixedOutgoType[]>([]);
	const [fixedIncome, setFixedIncome] = useState<fixedIncomeType[]>([]);

	useEffect(() => {
		axios
			.get("http://localhost:8000/fixedOutgo")
			.then((res) => {
				setFixedOutgo(res.data);
			})
			.catch((error) => {
				console.log(error);
			});
		axios
			.get("http://localhost:8000/fixedIncome")
			.then((res) => {
				setFixedIncome(res.data);
			})
			.catch((error) => {
				console.log(error);
			});
	}, []);

	return (
		<Container>
			<h3>금융 일정 📆</h3>
			<div className="lists">
				{fixedOutgo.map((el) => {
					return (
						<List key={uuidv4()} date={el.date}>
							<div className="list__day__outgo">
								{new Date(el.date).getDate()}일
							</div>
							<div className="list__write__outgo">
								<p>{el.outgoName}</p>
								<p>
									{el.money.toLocaleString()}원 / <span>지출</span>
								</p>
							</div>
						</List>
					);
				})}
				{fixedIncome.map((el) => {
					return (
						<List key={uuidv4()} date={el.date}>
							<div className="list__day__income">
								{new Date(el.date).getDate()}일
							</div>
							<div className="list__write__income">
								<p>{el.incomeName}</p>
								<p>
									{el.money.toLocaleString()}원 / <span>수입</span>
								</p>
							</div>
						</List>
					);
				})}
			</div>
			<button>금융 일정 관리하기</button>
		</Container>
	);
};

export default Schedule;

const Container = styled.div`
	margin-left: 1rem;
	width: 22.5%;
	height: 42.8rem;
	padding: 2rem;
	border-radius: 8px;
	border: 1px solid #d9d9d9;
	position: relative;

	h3 {
		font-size: 1.8rem;
		font-weight: 400;
	}

	button {
		width: 85%;
		position: absolute;
		bottom: 3rem;
		background: #e5ebff;
		color: #849fff;
		border-radius: 8px;
		padding: 1rem 2rem;

		&:hover {
			background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
			color: #fff;
		}
	}

	.lists {
		margin-top: 2rem;
		overflow-y: scroll;
	}
`;

const List = styled.div<{ date: string }>`
	display: flex;
	margin-top: 1.2rem;
	align-items: center;

	.list__day__outgo {
		width: 50px;
		height: 35px;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem 2.5rem;
		background: ${(props) =>
			new Date(props.date).getDate() - new Date().getDate() < 0 ||
			new Date(props.date).getDate() - new Date().getDate() >= 7
				? props.theme.COLORS.LIGHT_GREEN
				: new Date(props.date).getDate() - new Date().getDate() < 3
				  ? props.theme.COLORS.LIGHT_RED
				  : props.theme.COLORS.LIGHT_YELLOW};
		border-radius: 8px;
		color: #fff;
		font-size: 1.2rem;
		white-space: nowrap;
		margin-right: 1.2rem;
	}

	.list__day__income {
		width: 50px;
		height: 35px;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem 2.5rem;
		background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
		border-radius: 8px;
		color: #fff;
		font-size: 1.2rem;
		white-space: nowrap;
		margin-right: 1.2rem;
	}

	.list__write__outgo {
		display: flex;
		flex-direction: column;
		line-height: 20px;

		p {
			font-size: 1.4rem;
			&:last-child {
				color: gray;
				font-size: 1.1rem;
			}
		}

		span {
			color: ${(props) => props.theme.COLORS.LIGHT_RED};
		}
	}

	.list__write__income {
		display: flex;
		flex-direction: column;
		line-height: 20px;

		p {
			font-size: 1.4rem;
			&:last-child {
				color: gray;
				font-size: 1.1rem;
			}
		}

		span {
			color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
		}
	}
`;
