import styled from "styled-components";
import { SvgIcon } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { ReactComponent as Logo } from "../../assets/Slogo.svg";
import { Input, PasswordLabel, SubmitBtn } from "../login";
import { checkEmail, checkPassword } from "src/utils/validCheck";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "src/utils/timeFunc";
import axios from "axios";
import { setCookie } from "src/utils/cookie";
interface inputType {
	[key: string]: any;
	email: string;
	password: string;
	passwordCheck: string;
	authNum: string;
}

interface errorType {
	email: string;
	password: string;
	passwordCheck: string;
	authNum: string;
}

interface confirmType {
	isOpen: boolean;
	minutes: number;
	seconds: number;
}

const SignUp = () => {
	const [values, setValues] = useState<inputType>({
		email: "",
		password: "",
		passwordCheck: "",
		authNum: "",
	});
	const [errorMsg, setErrorMsg] = useState<errorType>({
		email: "",
		password: "",
		passwordCheck: "",
		authNum: "",
	});
	// 입력값 검사 통과 여부(email은 유효성, 중복 검사 및 인증번호까지 포함)
	const [isAuth, setIsAuth] = useState<boolean>(false);

	// 비밀번호 입력 창의 type=password or text
	const [isVisible, setIsVisible] = useState<boolean>(false);

	// 이메일 입력 창 버튼 비활성화 or 활성화 상태
	const [isDisabled, setIsDisabled] = useState<boolean>(true);
	const [empty, setEmpty] = useState<boolean>(true);

	const [isConfirm, setIsConfirm] = useState<confirmType>({
		isOpen: false,
		minutes: 5,
		seconds: 0,
	}); // 인증번호 발송 시 상태 (서버 기능 구현 전까지는 클릭하면 true로)

	const navigate = useNavigate();

	const onChangeValues = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setValues({ ...values, [name]: value });

		switch (name) {
			case "email":
				checkEmail(value) ? setIsDisabled(false) : setIsDisabled(true);
				break;
			case "password":
				if (!checkPassword(value)) {
					setErrorMsg({
						...errorMsg,
						[name]: "8~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요.",
					});
				} else {
					setErrorMsg({ ...errorMsg, [name]: "" });
				}
				// 비밀번호 확인 값을 입력한 뒤 비밀번호를 변경할 때 예외처리
				if (values.passwordCheck !== "") {
					if (values.passwordCheck !== value) {
						setErrorMsg({
							...errorMsg,
							passwordCheck: "비밀번호가 일치하지 않습니다.",
						});
					} else {
						setErrorMsg({ ...errorMsg, passwordCheck: "" });
					}
				}
				break;
			case "passwordCheck":
				if (values.password !== value) {
					setErrorMsg({ ...errorMsg, [name]: "비밀번호가 일치하지 않습니다." });
				} else {
					setErrorMsg({ ...errorMsg, [name]: "" });
				}
				break;
		}
	};

	// 패스워드 확인 입력창 클릭 시 일치하는지 확인
	const checkPwdCheckInput = () => {
		if (values.password.length) {
			values.password !== values.passwordCheck
				? setErrorMsg({
						...errorMsg,
						passwordCheck: "비밀번호가 일치하지 않습니다.",
				  })
				: setErrorMsg({ ...errorMsg, passwordCheck: "" });
		}
	};

	// 비밀번호 표시/감추기 버튼 클릭 시 실행되는 함수
	const onClickVisibleBtn = () => {
		setIsVisible(!isVisible);
	};

	const onClickAuthBtn = () => {
		// 인증번호 발송 로직 구현해야함.
		// 발송 되면 모달 띄우기
		setIsConfirm({ isOpen: true, minutes: 5, seconds: 0 });
	};

	const onClickCerBtn = () => {
		// 인증번호가 일치하다면
		// 인증완료 토스트 창 띄우고
		setIsAuth(true);
		setIsConfirm({ ...isConfirm, isOpen: false });
	};

	const checkValues = useCallback(
		debounce((values: inputType, isAuth: boolean) => {
			let isBlank = false;
			let isNotValid = true;

			// 빈 값 체크
			for (const key in values) {
				if (values[key] === "") {
					isBlank = true;
				}
			}
			if (!isBlank && isAuth && values.passwordCheck === values.password) {
				isNotValid = false;
			}
			setEmpty(isNotValid);
		}, 700),
		[],
	);

	const onClickSubmitBtn = () => {
		axios
			.post("http://localhost:8000/register", {
				email: values.email,
				password: values.password,
			})
			.then((res) => {
				setCookie("accessToken", res.data.accessToken, { path: "/" });
				navigate("/login");
			})
			.catch((error) => {
				console.log(error);
			});
	};

	useEffect(() => {
		let countDown: NodeJS.Timeout | null = null;

		if (isConfirm.isOpen) {
			countDown = setInterval(() => {
				setIsConfirm((prevState) => {
					let seconds = prevState.seconds;
					let minutes = prevState.minutes;

					if (seconds > 0) {
						seconds--;
					} else {
						if (minutes > 0) {
							minutes--;
							seconds = 59;
						} else {
							clearInterval(countDown!);
						}
					}
					return { ...prevState, seconds, minutes };
				});
			}, 1000);
		}

		return () => {
			clearInterval(countDown!);
		};
	}, [isConfirm.isOpen]);

	useEffect(() => {
		checkValues(values, isAuth);
	}, [values, isAuth]);

	return (
		<Container>
			<SignUpContainer>
				<Logo />
				<h3>회원가입</h3>
				<Title>이메일</Title>
				<InputContainer>
					<InputW80
						type="email"
						name="email"
						onChange={onChangeValues}
						disabled={isAuth}
					/>
					<CerBtnBlue disabled={isDisabled || isAuth} onClick={onClickAuthBtn}>
						인증
					</CerBtnBlue>
				</InputContainer>
				<WarningTitle>이미 존재하는 이메일입니다.</WarningTitle>
				{isConfirm.isOpen ? (
					<>
						<Title>인증번호</Title>
						<InputContainer>
							<InputW80
								type="text"
								name="authNum"
								onChange={onChangeValues}
								disabled={isAuth}
							/>
							{isConfirm.isOpen ? (
								<span>
									{isConfirm.minutes}:
									{isConfirm.seconds < 10
										? `0${isConfirm.seconds}`
										: isConfirm.seconds}
								</span>
							) : null}
							{isConfirm.minutes === 0 && isConfirm.seconds === 0 ? (
								<CerBtnRed>재발송</CerBtnRed>
							) : (
								<CerBtnBlue onClick={onClickCerBtn}>확인</CerBtnBlue>
							)}
						</InputContainer>
					</>
				) : null}
				<Title>비밀번호</Title>
				<PasswordLabel>
					<Input
						type={isVisible ? "text" : "password"}
						name="password"
						onChange={onChangeValues}
					/>
					<button onClick={onClickVisibleBtn}>
						{isVisible ? (
							<SvgIcon
								component={VisibilityOffRoundedIcon}
								sx={{ stroke: "#ffffff", strokeWidth: 1 }}
							/>
						) : (
							<SvgIcon
								component={VisibilityRoundedIcon}
								sx={{ stroke: "#ffffff", strokeWidth: 1 }}
							/>
						)}
					</button>
				</PasswordLabel>
				<WarningTitle>{errorMsg.password}</WarningTitle>
				<Title>비밀번호 확인</Title>
				<Input
					type="password"
					name="passwordCheck"
					onChange={onChangeValues}
					onClick={checkPwdCheckInput}
				/>
				<WarningTitle>{errorMsg.passwordCheck}</WarningTitle>
				<SmallTitle>
					이미 계정이 있으신가요?{" "}
					<span
						onClick={() => {
							navigate("/login");
						}}
					>
						로그인 화면으로 이동
					</span>
				</SmallTitle>
				<SubmitBtn disabled={empty} onClick={onClickSubmitBtn}>
					<p>회원가입</p>
				</SubmitBtn>
			</SignUpContainer>
		</Container>
	);
};

const Container = styled.div`
	width: 100%;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
`;

const SignUpContainer = styled.div`
	width: 47rem;
	height: 85vh;
	display: flex;
	flex-direction: column;

	h3 {
		font-size: 2.4rem;
		color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
		margin-bottom: 2rem;
	}
`;

const Title = styled.p`
	color: ${(props) => props.theme.COLORS.GRAY_500};
	font-size: 1.4rem;
	margin-top: 2rem;
`;

const SmallTitle = styled(Title)`
	font-size: 1.2rem;
	margin-top: 3rem;

	span {
		margin-left: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		text-decoration: underline;
	}
`;

const InputContainer = styled.div`
	display: flex;
	justify-content: space-between;
	position: relative;

	span {
		font-size: 1.2rem;
		color: ${(props) => props.theme.COLORS.LIGHT_RED};
		position: absolute;
		top: 53%;
		right: 10.5rem;
	}
`;

const InputW80 = styled(Input)`
	width: 80%;
	height: 3.8rem;
`;

const CerBtnBlue = styled.button`
	width: 15%;
	height: 3.8rem;
	margin-top: 1.5rem;
	border-radius: 6px;
	background-color: ${(props) => props.theme.COLORS.SKY};
	color: #6385ff;

	&:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
`;

const CerBtnRed = styled(CerBtnBlue)`
	color: ${(props) => props.theme.COLORS.WHITE};
	background-color: ${(props) => props.theme.COLORS.LIGHT_RED};
`;

const WarningTitle = styled.p`
	font-size: 1.2rem;
	margin-top: 0.5rem;
	color: ${(props) => props.theme.COLORS.LIGHT_RED};
`;

export default SignUp;
