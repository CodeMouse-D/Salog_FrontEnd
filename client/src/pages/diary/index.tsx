import { SvgIcon } from "@mui/material";
import { styled } from "styled-components";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import NotData from "../../assets/NotData.png";
import { Input } from "../login";
import dateAsKor from "src/utils/dateAsKor";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CalendarComponent from "./Calendar";
import { api } from "src/utils/refreshToken";
import useDebounce from "src/hooks/useDebounce";
import Loading from "src/components/Layout/Loading";
import useIntersectionObserver from "src/hooks/useIntersectionObserver";
// import { useScroll } from "src/hooks/useScroll";

export interface diaryType {
  diaryId: number;
  date: string;
  title: string;
  body: string;
  img: string;
  tagList: TagList[];
}

export interface TagList {
  diaryTagId: number;
  tagName: string;
}

interface pageType {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface tagType {
  diaryTagId: number;
  tagName: string;
  diaryCount: number;
}

const Diary = () => {
  const [diaries, setDiaries] = useState<diaryType[]>([]);
  const [tagLists, setTagLists] = useState<tagType[]>([]);
  const [searchType, setSearchType] = useState<string>("title");
  const [searchVal, setSearchVal] = useState<string>("");
  // 전체보기 숫자에 사용 될 상태
  const [totalElement, setTotalElement] = useState<number>(0);

  // 무한 스크롤에 사용 될 페이지와 로딩 상태
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState<pageType>({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [observe, unobserve] = useIntersectionObserver(() => {
    setPage((page) => page + 1);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(false); // top 버튼을 보여주는 상태
  const debouncedSearchVal = useDebounce(searchVal, 300); // 300ms 딜레이로 디바운스 적용

  const path = useLocation().pathname;
  const search = useLocation().search;

  // 이전 경로를 저장하기 위한 상태
  const [previousPath, setPreviousPath] = useState(path);
  const [previousSearch, setPreviousSearch] = useState(search);

  // 이전 path와 search 값 저장 변수
  const decodeUrl = decodeURI(search).split("=")[1];
  const target = useRef(null);

  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const onClickWriteBtn = () => {
    navigate("/diary/post");
  };

  const onClickList = (id: number) => {
    navigate(`/diary/${id}`);
  };

  const onChangeSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
  };

  const onChangeSearchType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(e.target.value);
  };

  const onClickSearchBtn = () => {
    navigate(`${path}?searchType=${searchType}&query=${searchVal}`);
  };

  const onKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onClickSearchBtn();
    }
  };

  const categoryOrganize = () => {
    const arr = [];
    for (const obj of tagLists) {
      arr.push(
        <NavStyle
          to={`/diary?diaryTag=${obj.tagName}`}
          key={obj.diaryTagId}
          className={decodeUrl === obj.tagName ? "active" : ""}
        >
          <p>{obj.tagName}</p>
          &nbsp;
          <span>{`(${obj.diaryCount})`}</span>
        </NavStyle>
      );
    }
    return arr;
  };

  useEffect(() => {
    api
      .get("/diaryTags")
      .then((res) => {
        setTagLists(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
    // Top 버튼을 위한 스크롤 감지
    const handleShowButton = () => {
      if (window.scrollY > 280) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
    window.addEventListener("scroll", handleShowButton);
    return () => {
      window.removeEventListener("scroll", handleShowButton);
    };
  }, []);

  useEffect(() => {
    if (page === 1 && target?.current) {
      observe(target.current);
    }

    const N = diaries.length;
    const totalCount = pageInfo.totalElements;

    if ((N === 0 || totalCount <= N) && target?.current) {
      unobserve(target.current);
    }
  }, [diaries]);

  // page 변경 감지에 따른 API호출
  useEffect(() => {
    if (path !== previousPath || search !== previousSearch) {
      setPage(1); // path 또는 search가 변경된 경우에만 page를 1로 초기화
    }
    // 경로 변화를 확인한 후에는 현재 경로로 상태 최신화
    setPreviousPath(path);
    setPreviousSearch(search);

    fetchData().catch((error) => {
      console.log(error);
    });
  }, [page, path, search]);

  const handleResponse = (response: any) => {
    if (page > 1) {
      setDiaries((prevData) => [...prevData, ...response.data.data]);
    } else {
      setDiaries(response.data.data);
      setPageInfo(response.data.pageInfo);
      if (response.data.pageInfo) {
        setTotalElement(response.data.pageInfo.totalElements);
      }
    }
  };

  const fetchData = async () => {
    setIsLoading(true);

    try {
      // 검색 기능
      if (search.includes("searchType")) {
        const searchParams = new URLSearchParams(search);
        const searchType = searchParams.get("searchType");
        const query = searchParams.get("query");

        if (query && query.includes(" ")) {
          alert("검색어에 공백을 포함할 수 없습니다");
          return;
        }

        const API_URL = `/diary/search?page=${page}&size=10&searchType=${searchType}&query=${query}`;
        const response = await api.get(API_URL);
        handleResponse(response);
      }
      // 일반 조회 (전체/태그/날짜)
      else {
        const searchParams = new URLSearchParams(search);
        const diaryTag = searchParams.get("diaryTag");
        const date = searchParams.get("date");

        let API_URL = `/diary?page=${page}&size=10`;

        // 태그나 날짜 파라미터가 있으면 추가
        if (diaryTag) API_URL += `&diaryTag=${diaryTag}`;
        if (date) API_URL += `&date=${date}`;

        const response = await api.get(API_URL);
        handleResponse(response);
      }
    } catch (error) {
      console.error("데이터 조회 중 오류 발생:", error);
      // 에러 처리
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (debouncedSearchVal === "") {
      navigate(`${path}`);
    } else {
      navigate(`${path}?searchType=${searchType}&query=${debouncedSearchVal}`);
    }
  }, [debouncedSearchVal]);

  return (
    <>
      <Container>
        <DiaryContainer>
          <DiaryTitle>
            <h2>일기</h2>
            <WriteBtn onClick={onClickWriteBtn}>
              <SvgIcon
                component={CreateOutlinedIcon}
                sx={{ stroke: "#ffffff", strokeWidth: 1 }}
              />
              <p>일기 작성하기</p>
            </WriteBtn>
          </DiaryTitle>
          <SubTitle>일기를 기록하여 하루를 정리해보세요!</SubTitle>
          <hr />
          {diaries?.length !== 0 ? (
            <>
              {search === "" || search === "?title=" ? (
                <h3>분류 전체보기 ({pageInfo.totalElements})</h3>
              ) : (
                <h3>
                  {decodeUrl} ({pageInfo.totalElements})
                </h3>
              )}
              <ListContainer>
                {diaries?.map((diary) => {
                  return (
                    <List
                      key={diary.diaryId}
                      onClick={() => {
                        onClickList(diary.diaryId);
                      }}
                    >
                      <ListMain>
                        <h4>{diary.title}</h4>
                        <p>{diary.body.replace(/(<([^>]+)>)/gi, "")}</p>
                        <Tags>
                          {diary.tagList.map((tag) => {
                            return (
                              <Tag key={tag.diaryTagId}>{tag.tagName}</Tag>
                            );
                          })}
                        </Tags>
                        <Info>
                          <p>{dateAsKor(diary.date)}</p>
                          {/* 리팩토링으로 건의 예정 */}
                          {/* <p>지출 내역: 4개 / 수입 내역: 0개</p> */}
                        </Info>
                      </ListMain>
                      {diary.img !== "" && <img src={diary.img} alt="이미지" />}
                    </List>
                  );
                })}
              </ListContainer>
              {isLoading && <Loading />}
              <div ref={target} style={{ width: "100%", height: 30 }}></div>
            </>
          ) : (
            <NotDataContainer>
              <div className="img_background">
                <img src={NotData} alt="데이터 없음" />
              </div>
              <p>작성된 일기가 없습니다.</p>
            </NotDataContainer>
          )}
        </DiaryContainer>
        <div className="remain">
          <div className="blank"></div>
          <RemainContainer>
            <SearchContainer>
              <div className="header">
                <div className="header-left">
                  <SvgIcon
                    component={SearchOutlinedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 1 }}
                  />
                  <h3>검색</h3>
                </div>
                <select value={searchType} onChange={onChangeSearchType}>
                  <option value="title">제목</option>
                  <option value="body">내용</option>
                  <option value="title_body">제목+내용</option>
                </select>
              </div>
              <hr />
              <div className="search_input">
                <div className="search_row">
                  <Input
                    placeholder="게시글 검색"
                    value={searchVal}
                    onChange={onChangeSearchInput}
                    onKeyDown={onKeyDownSearch}
                  />
                  <button onClick={onClickSearchBtn}>
                    <SvgIcon
                      component={SearchOutlinedIcon}
                      sx={{ stroke: "#ffffff", strokeWidth: 1 }}
                    />
                  </button>
                </div>
              </div>
            </SearchContainer>
            <CategoryContainer>
              <div className="header">
                <SvgIcon
                  component={CategoryOutlinedIcon}
                  sx={{ stroke: "#ffffff", strokeWidth: 1 }}
                />
                <h3>태그</h3>
              </div>
              <hr />
              <NavStyle to="/diary" className={search === "" ? "active" : ""}>
                <p>전체보기</p>&nbsp;
                <span>{`(${totalElement})`}</span>
              </NavStyle>
              {categoryOrganize()}
            </CategoryContainer>
            <CalendarComponent />
          </RemainContainer>
        </div>
        {showButton && (
          <div className="scroll__container">
            <button id="top" onClick={scrollToTop} type="button">
              Top
            </button>
          </div>
        )}
      </Container>
    </>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  padding-bottom: 6.4rem;
  padding-left: 1.5rem;

  /* &::-webkit-scrollbar {
		display: none;
	} */

  .remain {
    width: 30%;
  }

  .blank {
    height: 12.8rem;
  }

  .scroll__container {
    position: fixed;
    right: 5%;
    bottom: 5%;
    z-index: 1;
  }
  #top {
    font-weight: bold;
    font-size: 15px;
    padding: 15px 10px;
    background-color: #000;
    color: #fff;
    border: 1px solid rgb(210, 204, 193);
    border-radius: 50%;
    outline: none;
    cursor: pointer;
  }
  #top:hover {
    color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  }
`;

const DiaryContainer = styled.div`
  margin-top: 3rem;
  width: 75rem;

  hr {
    width: 100%;
    border: none;
    height: 1px;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    background-color: ${(props) => props.theme.COLORS.GRAY_300};
  }

  h3 {
    margin: 2rem 0;
    font-size: 1.8rem;
    color: ${(props) => props.theme.COLORS.GRAY_600};
    text-align: center;
  }
`;

const RemainContainer = styled.div`
  margin-top: 3rem;
  margin-left: 3rem;
  /* width: 30%; */
`;

const ListContainer = styled.ul`
  margin-top: 2rem;
`;

const DiaryTitle = styled.div`
  display: flex;
  justify-content: space-between;
  height: 3rem;

  h2 {
    font-size: 2rem;
    color: ${(props) => props.theme.COLORS.GRAY_600};
  }
`;

const SubTitle = styled.p`
  font-size: 1.4rem;
  margin-top: 1rem;
  font-weight: 500;
  color: ${(props) => props.theme.COLORS.GRAY_500};
`;

const WriteBtn = styled.button`
  background-color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  border-radius: 4px;
  padding: 1.3rem;
  display: flex;
  align-items: center;

  svg {
    color: white;
  }

  p {
    margin-left: 0.5rem;
    font-size: 1.2rem;
    color: ${(props) => props.theme.COLORS.WHITE};
  }
`;

const List = styled.li`
  display: flex;
  height: 15rem;
  justify-content: space-between;
  border: 1px solid ${(props) => props.theme.COLORS.GRAY_200};
  padding: 0 2rem;
  padding-top: 1.5rem;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  box-shadow: 1px 1px 1px rgb(0, 0, 0, 25%);
  cursor: pointer;

  img {
    width: 17rem;
  }
`;

const ListMain = styled.div`
  width: 65%;
  display: flex;
  flex-direction: column;

  h4 {
    font-size: 1.8rem;
    color: ${(props) => props.theme.COLORS.GRAY_600};
  }

  p {
    min-height: 3rem;
    font-size: 1.2rem;
    margin-top: 1.2rem;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${(props) => props.theme.COLORS.GRAY_500};
  }
`;

const Tags = styled.ul`
  display: flex;
  margin-top: 0.5rem;
  min-height: 3rem;
`;

const Tag = styled.li`
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  margin-right: 0.5rem;
  background-color: ${(props) => props.theme.COLORS.GRAY_200};
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: 500;
  color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
`;

const Info = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 1;
  align-items: flex-end;
`;

const NotDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 15rem;

  .img_background {
    width: 100px;
    border-radius: 50px;
    padding: 2.5rem;
    margin-bottom: 2.5rem;
    background-color: ${(props) => props.theme.COLORS.GRAY_200};
  }

  img {
    width: 100%;
  }

  p {
    padding-left: 1rem;
    color: ${(props) => props.theme.COLORS.GRAY_600};
    font-size: 2rem;
    font-weight: 600;
  }
`;

const SearchContainer = styled.div`
  border: 1px solid ${(props) => props.theme.COLORS.GRAY_400};
  border-radius: 4px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  width: 100%;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-left {
      display: flex;
      align-items: center;

      svg {
        font-size: 2rem;
        margin-right: 0.5rem;
      }

      h3 {
        font-size: 1.6rem;
        color: ${(props) => props.theme.COLORS.GRAY_600};
      }
    }

    select {
      height: 3rem;
      padding: 0 1rem;
      border: 1px solid ${(props) => props.theme.COLORS.GRAY_300};
      border-radius: 4px;
      font-size: 1.2rem;
      color: ${(props) => props.theme.COLORS.GRAY_600};
      background-color: white;
    }
  }

  .search_input {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;

    .search_row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    input {
      flex: 1;
      height: 4rem;
    }

    button {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);

      svg {
        font-size: 2rem;
        &:hover {
          transition: 0.5s all;
          transform: scale(1.1);
        }
      }
    }
  }

  hr {
    width: 100%;
    border: none;
    height: 1px;
    margin: 1.8rem 0;
    background-color: ${(props) => props.theme.COLORS.GRAY_300};
  }
`;

const CategoryContainer = styled(SearchContainer)`
  margin-top: 3rem;
  min-height: 8rem;
`;

const NavStyle = styled(Link)`
  display: flex;
  font-size: 1.4rem;
  color: ${(props) => props.theme.COLORS.GRAY_600};
  font-weight: 500;
  margin-bottom: 1.5rem;

  p {
    &:hover {
      text-decoration: underline;
    }
  }

  &.active {
    p {
      color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
      font-size: 1.5rem;
      font-weight: 600;
    }
  }
`;

export default Diary;
