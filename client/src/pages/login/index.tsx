import styled from "styled-components";
import { useEffect, useState } from "react";
import { SvgIcon } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
// import { ReactComponent as Kakao } from "../../assets/Kakao.svg";
import { ReactComponent as Google } from "../../assets/Google.svg";
// import { ReactComponent as Naver } from "../../assets/Naver.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setCookie } from "src/utils/cookie";
import { useDispatch, useSelector } from "react-redux";
import { login } from "src/store/slices/userSlice";
import { type AppDispatch, type RootState } from "src/store";
import { api } from "src/utils/refreshToken";
import moment from "moment";
import circulateSchedule from "src/utils/circulateSchedule";
import {
  setIncomeSchedule,
  setOutgoSchedule,
} from "src/store/slices/scheduleSlice";
import useDidMountEffect from "src/hooks/useDidMountEffect";
import { hideToast } from "src/store/slices/toastSlice";
import Toast, { ToastType } from "src/components/Layout/Toast";

interface userType {
  email: string;
  password: string;
}

interface incomeType {
  fixedIncomeId: number;
  date: string;
  money: number;
  incomeName: string;
}

interface outgoType {
  fixedOutgoId: number;
  date: string;
  money: number;
  outgoName: string;
}

const Login = () => {
  const [values, setValues] = useState<userType>({ email: "", password: "" });
  const [error, setError] = useState<userType>({ email: "", password: "" });
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [saveId, setSaveId] = useState<boolean>(false);
  const [autoLogin, setAutoLogin] = useState<boolean>(false);
  const member = useSelector((state: RootState) => state.persistedReducer.user);
  const modal = useSelector((state: RootState) => state.persistedReducer.toast);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // 이메일, 비밀번호가 변경될 때 상태를 저장하는 함수
  const onChangeValues = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };
  // 비밀번호 표시/감추기 버튼 클릭 시 실행되는 함수
  const onClickVisibleBtn = () => {
    setIsVisible(!isVisible);
  };

  // 로그인 버튼 클릭 핸들러
  const onClickLoginBtn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await handleLogin(values.email, values.password);
    } catch (error) {
      console.log(error);

      // handleLogin 내부에서 이미 에러 처리됨
    }
  };

  const onClickGoogleBtn = () => {
    // window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=email&client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_GOOGLE_REDIRECT_URL}`;
    window.location.href =
      "https://server.salog.kro.kr/oauth2/authorization/google";
  };

  const handleAutoLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoLogin(e.target.checked);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/members/login`,
        { email, password }
      );

      const current = new Date();
      current.setMinutes(current.getMinutes() + 30);

      // 토큰 설정
      const accessToken = response.data.accessToken;
      setCookie("accessToken", accessToken, {
        path: "/",
        expires: current,
      });
      localStorage.setItem("accessToken", accessToken);

      // 자동 로그인 처리
      if (autoLogin) {
        const refreshTokenExpiry = new Date(
          current.getTime() + 30 * 24 * 60 * 60 * 1000
        );
        setCookie("refreshToken", response.data.refreshToken, {
          path: "/",
          expires: refreshTokenExpiry,
        });

        // 자동 로그인 정보 저장
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("savedPassword", password);
      } else {
        // 자동 로그인이 해제되면 관련 정보 삭제
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
      }

      // 아이디 저장 처리
      if (saveId) {
        localStorage.setItem("rememberedId", email);
      } else {
        localStorage.removeItem("rememberedId");
      }

      // 사용자 정보 가져오기
      const memberResponse = await api.get("/members/get");
      dispatch(login(memberResponse.data.data));
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response?.data.status === 404) {
        setError((prev) => ({ ...prev, email: "존재하지 않는 계정입니다." }));
      } else if (error.response?.data.status === 400) {
        setError((prev) => ({
          ...prev,
          password: "비밀번호가 일치하지 않습니다.",
        }));
      } else {
        // 기타 에러 처리
        console.error("Unexpected error during login:", error);
      }
      throw error;
    }
  };

  // 아이디 저장 체크박스 핸들러
  const handleSaveIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveId(e.target.checked);
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    const rememberedId = localStorage.getItem("rememberedId");

    // 자동 로그인 정보가 있는 경우
    if (savedEmail && savedPassword) {
      setValues({ email: savedEmail, password: savedPassword });
      setAutoLogin(true);
      setSaveId(true);
      try {
        void handleLogin(savedEmail, savedPassword);
      } catch (error) {
        console.error("자동 로그인 실패:", error);
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
        localStorage.removeItem("accessToken");
      }
    }
    // 저장된 아이디만 있는 경우
    else if (rememberedId) {
      setValues((prev) => ({ ...prev, email: rememberedId }));
      setSaveId(true);
    }
  }, []);

  // user 전역 상태가 변경되면 실행
  useDidMountEffect(() => {
    if (member.homeAlarm) {
      const date = moment().format("YYYY-MM");
      const customDate = `${date}-00`;
      api
        .get(`/fixedOutgo/get?page=1&size=10&date=${customDate}`)
        .then((res) => {
          const filteredOutgo = res.data.data.filter((el: outgoType) =>
            circulateSchedule(el.date)
          );
          // const doubleFilteredOutgo = filteredOutgo.filter(
          //   (el: outgoType) => !outgoIdArray.includes(el.fixedOutgoId)
          // );
          dispatch(setOutgoSchedule([...filteredOutgo]));
        })
        .catch((error) => {
          console.error(error);
          // 적절한 에러 처리 방식 선택
        });

      api
        .get(`/fixedIncome/get?page=1&size=10&date=${customDate}`)
        .then((res) => {
          const filteredIncome = res.data.data.filter((el: incomeType) =>
            circulateSchedule(el.date)
          );
          // const doubleFilteredIncome = filteredIncome.filter(
          //   (el: incomeType) => !incomeIdArray.includes(el.fixedIncomeId)
          // );
          dispatch(setIncomeSchedule([...filteredIncome]));
        })
        .catch((error) => {
          console.error(error);
          // 적절한 에러 처리 방식 선택
        });
    }
  }, [member]);

  // 전역상태를 이용한 토스트 창 띄우기

  useEffect(() => {
    setTimeout(() => {
      // 타입 단언입니다. 이를 통해 modal.type이 ToastType의 키 중 하나임을 명시적으로 알려주는 것
      if (modal.visible && Object.keys(ToastType).includes(modal.type)) {
        Toast(ToastType[modal.type as keyof typeof ToastType], modal.message);
        dispatch(hideToast());
      }
    }, 100);
  }, [modal, dispatch]);

  return (
    <Container>
      <LoginContainer>
        <h2
          onClick={() => {
            navigate("/");
          }}
        >
          로그인
        </h2>
        <LoginDiv>
          <form onSubmit={onClickLoginBtn}>
            <Title>이메일</Title>
            <EmailInputWrapper>
              <Input
                type="email"
                name="email"
                onChange={onChangeValues}
                value={values.email}
              />
              <SaveIdWrapper>
                <input
                  type="checkbox"
                  id="saveId"
                  checked={saveId}
                  onChange={handleSaveIdChange}
                />
                <label htmlFor="saveId">아이디 저장</label>
              </SaveIdWrapper>
            </EmailInputWrapper>
            <span>{error.email}</span>
            <Title>비밀번호</Title>
            <PasswordLabel>
              <Input
                type={isVisible ? "text" : "password"}
                name="password"
                onChange={onChangeValues}
                value={values.password}
              />
              <button type="button" onClick={onClickVisibleBtn}>
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
            <span>{error.password}</span>
            <AutoLoginWrapper>
              <input
                type="checkbox"
                id="autoLogin"
                checked={autoLogin}
                onChange={handleAutoLoginChange}
              />
              <label htmlFor="autoLogin">자동 로그인</label>
            </AutoLoginWrapper>
            <SubmitBtn type="submit">
              <p>로그인</p>
            </SubmitBtn>
          </form>
        </LoginDiv>
        <RedirectContainer>
          <p>비밀번호를 잊으셨나요?</p>
          <span
            onClick={() => {
              navigate("/findPassword");
            }}
          >
            비밀번호 찾기
          </span>
        </RedirectContainer>
        <RedirectContainer>
          <p>아직 회원이 아니신가요?</p>
          <span
            onClick={() => {
              navigate("/signup");
            }}
          >
            회원가입
          </span>
        </RedirectContainer>
        <TitleWithLine>
          <hr />
          <span>또는</span>
          <hr />
        </TitleWithLine>
        <OauthBtnContainer>
          {/* <OauthBtn>
            <Kakao />
          </OauthBtn> */}
          <OauthBtn onClick={onClickGoogleBtn}>
            <Google />
          </OauthBtn>
          {/* <OauthBtn>
            <Naver />
          </OauthBtn> */}
        </OauthBtnContainer>
      </LoginContainer>
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

const LoginContainer = styled.div`
  width: 43.5rem;
  height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    cursor: pointer;
    text-align: center;
    color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  }
`;

const LoginDiv = styled.div`
  width: 43.5rem;
  margin-top: 4rem;
  display: flex;
  flex-direction: column;

  p {
    font-size: 1.4rem;
  }

  span {
    font-size: 1.2rem;
    margin-top: 0.5rem;
    color: ${(props) => props.theme.COLORS.LIGHT_RED};
  }
`;

export const PasswordLabel = styled.label`
  position: relative;

  button {
    position: absolute;
    top: 50%;
    right: 2rem;
    transform: translateY(-50%);

    svg {
      font-size: 20px;
    }
  }
`;

// 스타일 추가
const EmailInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SaveIdWrapper = styled.div`
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;

  input[type="checkbox"] {
    width: 1.6rem;
    height: 1.6rem;
    margin-right: 0.8rem;
    cursor: pointer;
  }

  label {
    color: ${(props) => props.theme.COLORS.GRAY_500};
    font-size: 1.4rem;
    cursor: pointer;
  }
`;

export const Input = styled.input.attrs({ required: true })`
  width: 100%;
  height: 4.3rem;
  padding-left: 1rem;
  padding-right: 5.5rem;
  border-radius: 0.6rem;
  border: 1px solid ${(props) => props.theme.COLORS.GRAY_400};

  &.placeholder {
    color: ${(props) => props.theme.COLORS.GRAY_300};
  }

  &:focus {
    border: 1px solid ${(props) => props.theme.COLORS.LIGHT_BLUE};
  }
`;

const Title = styled.p`
  color: ${(props) => props.theme.COLORS.GRAY_500};
  margin-top: 2rem;
  margin-bottom: 1.5rem;
`;

const AutoLoginWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;

  input[type="checkbox"] {
    width: 1.6rem;
    height: 1.6rem;
    margin-right: 0.8rem;
    cursor: pointer;
  }

  label {
    color: ${(props) => props.theme.COLORS.GRAY_500};
    font-size: 1.4rem;
    cursor: pointer;
  }
`;

export const SubmitBtn = styled.button`
  width: 100%;
  height: 4.3rem;
  margin-top: 5rem;
  margin-bottom: 2rem;
  border-radius: 0.8rem;
  background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};

  p {
    color: ${(props) => props.theme.COLORS.WHITE};
    font-weight: 500;
    font-size: 1.6rem;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const RedirectContainer = styled.div`
  margin-top: 1rem;
  width: 19rem;
  text-align: center;
  justify-content: space-between;
  font-size: 1.2rem;

  p {
    display: inline;
    color: ${(props) => props.theme.COLORS.GRAY_500};
  }

  span {
    color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    margin-left: 0.5rem;
    cursor: pointer;
  }
`;

const TitleWithLine = styled.div`
  width: 43.5rem;
  margin-top: 1.5rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;

  hr {
    flex: auto;
    height: 1px;
    border: 0;
    background-color: ${(props) => props.theme.COLORS.GRAY_300};
  }

  span {
    padding: 0 10px;
    color: ${(props) => props.theme.COLORS.GRAY_500};
  }
`;

const OauthBtnContainer = styled.div`
  display: flex;
  margin-top: 1.5rem;
`;

const OauthBtn = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  margin: 0 1.5rem;
`;

export default Login;
