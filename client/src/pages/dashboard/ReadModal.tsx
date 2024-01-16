import { styled } from "styled-components";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import { SvgIcon } from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { useEffect, useState } from "react";
import { type modalType } from ".";
import axios from "axios";

interface Props {
	isOpen: modalType;
	setIsOpen: React.Dispatch<React.SetStateAction<modalType>>;
}

interface outgoType {
	id: number;
	date: string;
	outgoName: string;
	money: number;
	memo: string;
	outgoTag: string;
	wasteList: boolean;
	payment: string;
	reciptImg: string;
}

interface incomeType {
	id: number;
	incomeTag: string;
	date: string;
	money: number;
	income_name: string;
	memo: string;
}

const ReadModal = ({ isOpen, setIsOpen }: Props) => {
	const [outgo, setOutgo] = useState<outgoType[]>([]);
	const [income, setIncome] = useState<incomeType[]>([]);
	console.log(isOpen.day);

	const dateAsDots = (element: string) => {
		const originalDate = element;
		const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

		const date = new Date(originalDate);
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const dayOfWeekIndex = date.getDay(); // 요일 인덱스 (0: 일요일, 1: 월요일, ...)

		const convertedDate = `${year}.${month < 10 ? "0" + month : month}.${
			day < 10 ? "0" + day : day
		} (${daysOfWeek[dayOfWeekIndex]})`;

		return convertedDate;
	};

	const onClickCloseBtn = () => {
		setIsOpen({ ...isOpen, dayTile: false });
	};

	useEffect(() => {
		axios
			.get("http://localhost:8000/outgo")
			.then((res) => {
				setOutgo(res.data);
			})
			.catch((error) => {
				console.log(error);
			});

		axios
			.get("http://localhost:8000/income")
			.then((res) => {
				setIncome(res.data);
			})
			.catch((error) => {
				console.log(error);
			});
	}, []);

	return (
		<Background>
			<Container>
				<SvgIcon
					className="deleteIcon"
					component={ClearOutlinedIcon}
					onClick={onClickCloseBtn}
					sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
				/>
				<h3>11월 7일 가계부 내역</h3>
				<div className="total__container">
					<p className="total">총 220,000원</p>
					<button>
						<SvgIcon
							component={CreateOutlinedIcon}
							sx={{ stroke: "#ffffff", strokeWidth: 1 }}
						/>
						<p>수정하러 가기</p>
					</button>
				</div>
				<hr />
				<div className="titles">
					<p>분류</p>
					<p>날짜</p>
					<p>카테고리</p>
					<p>거래처</p>
					<p>결제수단</p>
					<p>금액</p>
					<p>메모</p>
				</div>
				{outgo.map((el) => {
					return (
						<div className="list" key={el.id}>
							<ColorRedDiv>지출</ColorRedDiv>
							<p className="date ft-size">{dateAsDots(el.date)}</p>
							<p className="tag ft-size">{el.outgoTag}</p>
							<p className="name ft-size">{el.outgoName}</p>
							<p className="method ft-size">{el.payment}</p>
							<p className="outgo_money ft-size">{`${el.money.toLocaleString()}원`}</p>
							<p className="memo ft-size">{el.memo}</p>
						</div>
					);
				})}
				{income.map((el) => {
					return (
						<div className="list" key={el.id}>
							<ColorBlueDiv>수입</ColorBlueDiv>
							<p className="date ft-size">{dateAsDots(el.date)}</p>
							<p className="tag ft-size">{el.incomeTag}</p>
							<p className="name ft-size">{el.income_name}</p>
							<p className="method ft-size">{"x"}</p>
							<p className="income_money ft-size">{`${el.money.toLocaleString()}원`}</p>
							<p className="memo ft-size">{el.memo}</p>
						</div>
					);
				})}
			</Container>
		</Background>
	);
};

export default ReadModal;

const Background = styled.div`
	width: 100vw;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.4);
	z-index: 100;
	position: absolute;
	top: 0;
	left: 0;
`;

const Container = styled.div`
	position: fixed;
	display: flex;
	flex-direction: column;
	width: 75rem;
	height: 43rem;
	border: 1px solid #d0d0d0;
	background: white;
	border-radius: 4px;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 200;
	padding: 4rem 5rem;

	.deleteIcon {
		cursor: pointer;
		font-size: 2.6rem;
		color: gray;
		position: absolute;
		right: 4rem;
		top: 3rem;
	}

	hr {
		width: 100%;
		background: #c4c4c4;
		border: none;
		height: 1px;
	}

	h3 {
		color: #4c4c4c;
		font-size: 2.2rem;
	}

	.total__container {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 2.5rem;
		margin-bottom: 1rem;

		p {
			font-size: 1.9rem;
			font-weight: 600;
			color: #4c4c4c;
		}

		button {
			cursor: pointer;
			display: flex;
			align-items: center;
			background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
			padding: 1rem 1.3rem;
			border-radius: 4px;

			svg {
				color: white;
			}

			p {
				margin-left: 0.5rem;
				font-size: 1.2rem;
				color: ${(props) => props.theme.COLORS.WHITE};
			}
		}
	}

	.titles {
		display: flex;
		gap: 2rem;
		margin-bottom: 0.5rem;
		margin-top: 1rem;

		p {
			font-size: 1.3rem;
			&:first-child {
				width: 4rem;
			}

			&:nth-child(2) {
				width: 8.2rem;
			}
			&:nth-child(3) {
				width: 5rem;
			}
			&:nth-child(4) {
				width: 9.3rem;
			}
			&:nth-child(6) {
				width: 6.8rem;
			}
		}
	}

	.list {
		display: flex;
		align-items: center;
		overflow-y: scroll;
		gap: 2rem;
		margin-top: 1.2rem;
	}

	.ft-size {
		font-size: 1.2rem;
		color: #474747;
	}

	.date {
		overflow: hidden;
		overflow-wrap: break-word;
		width: 8.2rem;
	}

	.tag {
		overflow: hidden;
		overflow-wrap: break-word;
		width: 5rem;
	}

	.name {
		overflow: hidden;
		overflow-wrap: break-word;
		width: 9.4rem;
	}

	.method {
		overflow: hidden;
		overflow-wrap: break-word;
		width: 4.5rem;
	}

	.outgo_money {
		overflow: hidden;
		overflow-wrap: break-word;
		width: 6.8rem;
		color: ${(props) => props.theme.COLORS.LIGHT_RED};
	}

	.income_money {
		color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
		overflow: hidden;
		overflow-wrap: break-word;
		width: 6.8rem;
	}

	.memo {
		overflow: hidden;
		overflow-wrap: break-word;
		width: 11rem;
	}
`;

const ColorRedDiv = styled.div`
	border-radius: 1.5rem;
	background-color: ${(props) => props.theme.COLORS.LIGHT_RED};
	padding: 0.5rem 1rem;
	font-size: 1.2rem;
	color: white;
`;

const ColorBlueDiv = styled.div`
	border-radius: 1.5rem;
	background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
	padding: 0.5rem 1rem;
	font-size: 1.2rem;
	color: white;
`;
