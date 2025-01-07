import { useState } from "react";
import { Outlet } from "react-router";
import { styled } from "styled-components";
import { Header } from "./Header";
import { SideBar } from "./SideBar";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Full>
      <Header onMenuClick={toggleSidebar} />
      <Inner>
        <SideBar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <Container $isSidebarOpen={isSidebarOpen}>
          <Content>
            <Outlet />
          </Content>
        </Container>
      </Inner>
      {isSidebarOpen && <Overlay onClick={() => setIsSidebarOpen(false)} />}
    </Full>
  );
};

const Full = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Inner = styled.div`
  width: 100%;
  height: 100vh;
  max-width: 135.8rem;
  background-color: white;
  padding-top: 6rem;
  display: flex;
  position: relative;

  ::-webkit-scrollbar {
    width: 3px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    height: 30%;
    background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
    border-radius: 2px;
  }

  @media (max-width: 1200px) {
    width: 100%;
  }
`;

const Container = styled.div<{ $isSidebarOpen: boolean }>`
  flex: 1;
  margin-left: 20rem;
  transition: margin-left 0.3s ease-in-out;

  @media (max-width: 1200px) {
    margin-left: ${({ $isSidebarOpen }) => ($isSidebarOpen ? "20rem" : "6rem")};
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: 123.5rem;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  display: none;

  @media (max-width: 1200px) {
    display: block;
  }
`;

export default MainLayout;
