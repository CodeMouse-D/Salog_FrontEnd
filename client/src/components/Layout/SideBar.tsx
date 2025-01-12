import styled, { css } from "styled-components";
import { SvgIcon } from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import PriceChangeOutlinedIcon from "@mui/icons-material/PriceChangeOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "src/store/slices/userSlice";
import { userLogout } from "src/utils/validCheck";
import { Logo, LogoTitle, MenuButton } from "./Header";
import logo from "../../assets/Slogo.png";

interface SideBarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const SideBar = ({ isOpen, onClose }: SideBarProps) => {
  const isActive = (paths: string[]) => {
    const location = useLocation();
    return paths.some((path) => location.pathname === path);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onclickLogout = () => {
    setIsModalOpen(true);
  };

  const onClickCloseBtn = () => {
    userLogout();

    // 자동 로그인 관련 데이터 제거
    localStorage.removeItem("savedEmail");
    localStorage.removeItem("savedPassword");
    localStorage.removeItem("accessToken");

    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <>
      <Container $isOpen={isOpen}>
        {isOpen && (
          <TopButtons>
            <MenuButton onClick={onClose}>
              <SvgIcon component={MenuIcon} />
            </MenuButton>
            <Logo
              onClick={() => {
                navigate("/dashboard");
              }}
            >
              <img src={logo} alt="로고" />
              <LogoTitle>샐로그</LogoTitle>
            </Logo>
          </TopButtons>
        )}
        <NavTitle>ACCOUNT BOOK</NavTitle>
        <Lists>
          <NavStyle
            to="/dashboard"
            $isOpen={isOpen}
            onClick={() => onClose?.()}
          >
            <SvgIcon
              component={GridViewIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>대시보드</ListTitle>
          </NavStyle>
          <NavStyle
            to="/history"
            $isActive={isActive(["/history", "/income", "/outgo", "/waste"])}
            $isOpen={isOpen}
          >
            <SvgIcon
              component={MenuBookIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>지출 · 수입</ListTitle>
          </NavStyle>
          <NavStyle to="/monthRadio" $isOpen={isOpen}>
            <SvgIcon
              component={SignalCellularAltIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>분석</ListTitle>
          </NavStyle>
          <NavStyle to="/budget" $isOpen={isOpen}>
            <SvgIcon
              component={PriceChangeOutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>예산</ListTitle>
          </NavStyle>
          <NavStyle to="/fixed__account" $isOpen={isOpen}>
            <SvgIcon
              component={AttachMoneyOutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>고정 지출 · 수입</ListTitle>
          </NavStyle>
        </Lists>
        <NavTitle>DIARY</NavTitle>
        <Lists>
          <NavStyle to="/diary" $isOpen={isOpen}>
            <SvgIcon
              component={StickyNote2OutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>일기</ListTitle>
          </NavStyle>
        </Lists>
        <NavTitle>ACCOUNT</NavTitle>
        <Lists>
          <NavStyle to="/inquiry" $isOpen={isOpen}>
            <SvgIcon
              component={ContactSupportOutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>문의</ListTitle>
          </NavStyle>
          <NavStyle to="/setting" $isOpen={isOpen}>
            <SvgIcon
              component={SettingsOutlinedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>설정</ListTitle>
          </NavStyle>
          <LogoutDiv onClick={onclickLogout} $isOpen={isOpen}>
            <SvgIcon
              component={ExitToAppRoundedIcon}
              sx={{ stroke: "#ffffff", strokeWidth: 0.5 }}
            />
            <ListTitle>로그아웃</ListTitle>
          </LogoutDiv>
        </Lists>
      </Container>
      <Modal
        state={isModalOpen}
        setState={setIsModalOpen}
        msgTitle={"로그아웃 하시겠습니까?"}
      >
        <button
          onClick={() => {
            setIsModalOpen((prev) => !prev);
          }}
        >
          취소
        </button>
        <button onClick={onClickCloseBtn}>확인</button>
      </Modal>
    </>
  );
};

const TopButtons = styled.div`
  display: flex;
  align-items: center;
`;

const NavTitle = styled.p`
  font-size: 1rem;
  padding: 1.5rem;
  color: ${(props) => props.theme.COLORS.GRAY_500};
`;

const ListTitle = styled.p`
  font-size: 1.5rem;
  padding: 1rem 1.5rem;
  color: ${(props) => props.theme.COLORS.GRAY_700};
  font-weight: 600;
`;

const Container = styled.div<{ $isOpen: boolean }>`
  border-right: 1px solid #e2e2e2;
  position: fixed;
  top: ${(props) => (props.$isOpen ? "0" : "6rem")};
  width: 20rem;
  height: ${(props) => (props.$isOpen ? "100%" : "calc(100% - 6rem)")};
  background-color: white;
  z-index: 100;
  overflow: hidden; // 추가
  white-space: nowrap; // 추가
  transition: width 0.3s ease-in;

  @media (max-width: 1200px) {
    width: ${({ $isOpen }) => ($isOpen ? "20rem" : "6rem")};

    ${ListTitle} {
      display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
    }

    ${NavTitle} {
      display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
    }
  }
`;

// const MobileHeader = styled.div`
//   display: none;
//   padding: 1rem;
//   justify-content: flex-end;
//   align-items: center;

//   @media (max-width: 1200px) {
//     display: flex;
//   }
// `;

// const CloseButton = styled.button`
//   background: none;
//   border: none;
//   cursor: pointer;
//   color: ${(props) => props.theme.COLORS.GRAY_600};

//   &:hover {
//     color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
//   }
// `;

const Lists = styled.div`
  border-bottom: 1px solid #e2e2e2;
`;

const NavStyle = styled(NavLink)<{ $isActive?: boolean; $isOpen: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem 1.3rem;
  cursor: pointer;

  > svg {
    font-size: 2.1rem;
    color: ${(props) => props.theme.COLORS.GRAY_600};
    border: 1px;
  }

  &:hover {
    background-color: #f0f3fd;
  }

  ${(props) =>
    !props.$isOpen &&
    `
    @media (max-width: 1200px) {
      padding: 1.5rem;
      justify-content: center;
    }
  `}

  ${(props) =>
    props.$isActive &&
    css`
      background-color: #e2e8ff;
      > svg,
      p {
        color: ${props.theme.COLORS.LIGHT_BLUE};
      }
    `}

  &.active {
    background-color: #e2e8ff;
    > svg,
    p {
      color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    }
  }
`;

const LogoutDiv = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem 1.3rem;
  cursor: pointer;

  > svg {
    font-size: 2.1rem;
    color: ${(props) => props.theme.COLORS.GRAY_600};
    border: 1px;
  }

  ${(props) =>
    !props.$isOpen &&
    `
    @media (max-width: 1200px) {
      padding: 1.5rem;
      justify-content: center;
    }
  `}

  &:hover {
    background-color: #f0f3fd;
  }

  &.active {
    background-color: #e2e8ff;
    > svg,
    p {
      color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    }
  }
`;
