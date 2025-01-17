import { css, styled } from "styled-components";
import moment from "moment";
import type { Moment } from "moment";
import { useEffect, useState } from "react";
import { SvgIcon } from "@mui/material";

import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";

import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import axios from "axios";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import HistoryList from "./History";
import IncomeList from "./IncomeList";
import WasteList from "./WasteList";
import OutgoList from "./OutgoList";
import LedgerWrite from "./LedgerWrite";
import { useDispatch } from "react-redux";
import { showToast } from "src/store/slices/toastSlice";
import { api } from "src/utils/refreshToken";
import UpdateModal from "./UpdateModal";
import PaginationComponent from "src/components/Layout/Paging";
import DateSelector from "./DateSelector";

export interface ledgerType {
  outgoId: number;
  incomeId: number;
  date: string;
  ledgerName: string;
  money: number;
  memo: string;
  ledgerTag: tagType;
  wasteList: boolean;
  payment: string;
  receiptImg: string;
}

export interface outgoType {
  outgoId: number;
  date: string;
  outgoName: string;
  money: number;
  memo: string;
  outgoTag: tagType;
  wasteList: boolean;
  payment: string;
  receiptImg: string;
}

export interface incomeType {
  incomeId: number;
  incomeTag: tagType;
  date: string;
  money: number;
  incomeName: string;
  memo: string;
}

export interface wasteType {
  outgoId: number;
  date: string;
  money: number;
  outgoName: string;
  memo: string;
  outgoTag: tagType;
  wasteList: boolean;
  payment: string;
  receiptImg: string;
}

interface sumOutgoType {
  monthlyTotal: number;
  tags: monthlyTagType[];
}

interface sumIncomeType {
  monthlyTotal: number;
  tags: monthlyTagType[];
}

interface sumWasteType {
  monthlyTotal: number;
  tags: monthlyTagType[];
}

interface monthlyTagType {
  tagName: string;
  tagSum: number;
}

interface tagType {
  ledgerTagId: number;
  tagName: string;
}

export interface checkedType {
  income: number[];
  outgo: number[];
  waste: number[];
}

export interface modalType {
  writeModal: boolean;
  deleteModal: boolean;
  updateModal: boolean;
  uploadModal: boolean;
  uploadCheckModal: boolean;
}

interface filterType {
  date: boolean;
  tag: boolean;
}

interface PageInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface PageInfoObj {
  outgo: PageInfo;
  income: PageInfo;
  waste: PageInfo;
  combined: PageInfo;
}

const History = () => {
  const [getMoment, setMoment] = useState(moment());

  const [ledger, setLedger] = useState<ledgerType[]>([]);
  const [outgo, setOutgo] = useState<outgoType[]>([]);
  const [income, setIncome] = useState<incomeType[]>([]);
  const [waste, setWaste] = useState<wasteType[]>([]);

  console.log(ledger);
  const [pageInfoObj, setPageInfoObj] = useState<PageInfoObj>({
    outgo: {
      pageNumber: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
    },
    income: {
      pageNumber: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
    },
    waste: {
      pageNumber: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
    },
    combined: {
      pageNumber: 0,
      pageSize: 0,
      totalElements: 0,
      totalPages: 0,
    },
  });

  const [sumOutgo, setSumOutgo] = useState<sumOutgoType>({
    monthlyTotal: 0,
    tags: [],
  });
  const [sumIncome, setSumIncome] = useState<sumIncomeType>({
    monthlyTotal: 0,
    tags: [],
  });
  const [sumWasteList, setSumWasteList] = useState<sumWasteType>({
    monthlyTotal: 0,
    tags: [],
  });

  const [isOpen, setIsOpen] = useState<modalType>({
    writeModal: false,
    deleteModal: false,
    updateModal: false,
    uploadModal: false,
    uploadCheckModal: false,
  });

  const [filtered, setFiltered] = useState<filterType>({
    date: false,
    tag: false,
  });

  // 체크박스 상태
  const [isAllChecked, setIsAllChecked] = useState(false);

  const [checkedList, setCheckedList] = useState<checkedType>({
    income: [],
    outgo: [],
    waste: [],
  });

  const [activePage, setActivePage] = useState(1);

  const [isChecked, setIsChecked] = useState(false);

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePageChange = (activePage: number) => {
    setActivePage(activePage);
  };

  const sortByDate = (array: any[]) => {
    const sortedArray = [...array];

    sortedArray.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return filtered.date
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    if (location.pathname === "/income") {
      setIncome(sortedArray);
      return;
    }
    if (location.pathname === "/outgo") {
      setOutgo(sortedArray);
      return;
    }
    if (location.pathname === "/waste") {
      setWaste(sortedArray);
    }
    if (location.pathname === "/history") {
      setLedger(sortedArray);
    }
  };

  const checkedItemHandler = (
    id: number,
    isChecked: boolean,
    division: keyof checkedType
  ) => {
    setCheckedList((prev) => {
      const updatedList = { ...prev };
      if (isChecked) {
        updatedList[division] = [...updatedList[division], id];
      } else {
        updatedList[division] = updatedList[division].filter(
          (item) => item !== id
        );
      }

      // 전체 체크 여부 판단
      const isAllIncomeChecked =
        location.pathname === "/outgo" || location.pathname === "/history"
          ? updatedList.outgo.length === outgo.length
          : true;
      const isAllOutgoChecked =
        location.pathname === "/income" || location.pathname === "/history"
          ? updatedList.income.length === income.length
          : true;
      const isAllWasteChecked =
        location.pathname === "/waste"
          ? updatedList.waste.length === waste.length
          : true;

      setIsAllChecked(
        isAllIncomeChecked && isAllOutgoChecked && isAllWasteChecked
      );

      return updatedList;
    });
  };

  const sumOfCheckedList = () => {
    const sumOfMoney = { outgo: 0, income: 0, waste: 0 };
    checkedList.outgo.forEach((id) => {
      const idx = outgo.findIndex((el) => el.outgoId === id);
      if (idx !== -1) sumOfMoney.outgo += outgo[idx].money;
    });
    checkedList.income.forEach((id) => {
      const idx = income.findIndex((el) => el.incomeId === id);
      if (idx !== -1) sumOfMoney.income += income[idx].money;
    });
    checkedList.waste.forEach((id) => {
      const idx = waste.findIndex((el) => el.outgoId === id);
      if (idx !== -1) sumOfMoney.waste += waste[idx]?.money;
    });

    if (location.pathname !== "/waste")
      return sumOfMoney.income - sumOfMoney.outgo;
    else return sumOfMoney.waste ?? 0;
  };

  const checkHandler = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
    division: keyof checkedType
  ) => {
    setIsChecked(!isChecked);
    checkedItemHandler(id, e.target.checked, division);
  };

  const handleAllChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;

    setIsAllChecked(checked); // isAllChecked 값을 true로 설정

    if (checked) {
      // setIsAllChecked(true); // isAllChecked 값을 true로 설정
      if (location.pathname === "/history") {
        outgo.forEach((el) => {
          !checkedList.outgo.includes(el.outgoId) &&
            setCheckedList((prev) => {
              const updatedList = { ...prev };
              updatedList.outgo = [...updatedList.outgo, el.outgoId];
              return updatedList; // 업데이트된 상태 반환
            });
        });
        income.forEach((el) => {
          !checkedList.income.includes(el.incomeId) &&
            setCheckedList((prev) => {
              const updatedList = { ...prev };
              updatedList.income = [...updatedList.income, el.incomeId];
              return updatedList; // 업데이트된 상태 반환
            });
        });
      } else if (location.pathname === "/outgo") {
        outgo.forEach((el) => {
          !checkedList.outgo.includes(el.outgoId) &&
            setCheckedList((prev) => {
              const updatedList = { ...prev };
              updatedList.outgo = [...updatedList.outgo, el.outgoId];
              return updatedList; // 업데이트된 상태 반환
            });
        });
      } else if (location.pathname === "/waste") {
        waste.forEach((el) => {
          !checkedList.waste.includes(el.outgoId) &&
            setCheckedList((prev) => {
              const updatedList = { ...prev };
              updatedList.waste = [...updatedList.waste, el.outgoId];
              return updatedList; // 업데이트된 상태 반환
            });
        });
      } else {
        income.forEach((el) => {
          !checkedList.income.includes(el.incomeId) &&
            setCheckedList((prev) => {
              const updatedList = { ...prev };
              updatedList.income = [...updatedList.income, el.incomeId];
              return updatedList; // 업데이트된 상태 반환
            });
        });
      }
    } else {
      // setIsAllChecked(false); // isAllChecked 값을 false로 설정
      setCheckedList({
        income: [],
        outgo: [],
        waste: [],
      });
    }
  };

  // 체크한 목록들을 삭제하는 함수
  const handleDeleteClick = () => {
    const deletePromises: Array<Promise<any>> = [];

    checkedList.outgo.length !== 0 &&
      checkedList.outgo.forEach((id) => {
        const deletePromise = api.delete(`/outgo/delete/${id}`);
        deletePromises.push(deletePromise);
      });

    checkedList.income.length !== 0 &&
      checkedList.income.forEach((id) => {
        const deletePromise = api.delete(`/income/delete/${id}`);
        deletePromises.push(deletePromise);
      });

    Promise.all(deletePromises)
      .then(() => {
        // 삭제 요청에 대한 응답 처리
        setIsOpen((prev) => ({ ...prev, deleteModal: false }));

        // 데이터 상태 최신화
        if (checkedList.income.length !== 0) {
          checkedList.income.forEach((id) => {
            setIncome((prevData) => {
              const data = prevData.filter((el) => {
                return el.incomeId !== id;
              });
              return data;
            });
          });
        }

        if (checkedList.outgo.length !== 0) {
          checkedList.outgo.forEach((id) => {
            setOutgo((prevData) => {
              const data = prevData.filter((el) => {
                return el.outgoId !== id;
              });
              return data;
            });
            setWaste((prevData) => {
              const data = prevData.filter((el) => {
                return el.outgoId !== id;
              });
              return data;
            });
          });
        }

        const date = getMoment.format("YYYY-MM");
        const customDate = `${date}-00`;

        api
          .get(`/calendar/ledger?page=1&size=10&date=${customDate}`)
          .then((res) => {
            setLedger(res.data.data);
          })
          .catch((error) => {
            console.log(error);
          });

        // 클라이언트에서 데이터 제거
        const updatedCheckedList = { ...checkedList };

        updatedCheckedList.outgo = [];
        updatedCheckedList.income = [];
        updatedCheckedList.waste = [];
        setCheckedList(updatedCheckedList);

        dispatch(
          showToast({ message: "삭제가 완료되었습니다", type: "success" })
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleAddWaste = async () => {
    const promises = checkedList.outgo.map(async (id) => {
      const idx = outgo.findIndex((el) => el.outgoId === id);

      // 이미 wasteList가 true인 경우 오류 메시지 표시
      if (outgo[idx].wasteList) {
        dispatch(
          showToast({
            message: "이미 존재하는 항목입니다",
            type: "error",
          })
        );
        return null; // 중복된 요소를 처리하지 않고 null을 반환하여 다음 작업으로 넘어감
      }

      return await api.patch(`/outgo/update/${id}`, {
        ...outgo[idx],
        outgoTag: outgo[idx].outgoTag.tagName,
        wasteList: true,
      });
    });

    const results = await Promise.all(promises);

    const updatedOutgo = [...outgo];
    const updatedWaste = [...waste];
    results.forEach((res) => {
      if (res) {
        const idx = updatedOutgo.findIndex(
          (el) => el.outgoId === res.data.outgoId
        );
        updatedOutgo[idx] = res.data;
        updatedWaste.push(res.data);
      }
    });

    if (results.some((res) => res)) {
      const successfulResultsCount = results.filter(
        (res) => res !== null
      ).length;
      setPageInfoObj((prevPageInfoObj) => ({
        ...prevPageInfoObj,
        waste: {
          ...prevPageInfoObj.waste,
          totalElements:
            prevPageInfoObj.waste.totalElements + successfulResultsCount,
        },
      }));
    }

    // 데이터 업데이트
    setOutgo(updatedOutgo);
    setWaste(updatedWaste);

    const date = getMoment.format("YYYY-MM");
    const customDate = `${date}-00`;

    const res = await api.get(
      `/calendar/ledger?page=1&size=10&date=${customDate}`
    );

    setLedger(res.data.data);

    if (results.some((res) => res)) {
      dispatch(
        showToast({
          message: "낭비리스트가 추가되었습니다",
          type: "success",
        })
      );
      navigate("/waste");
    }
    // } else {
    //   dispatch(
    //     showToast({
    //       message: "요청을 처리하는 동안 오류가 발생했습니다",
    //       type: "error",
    //     })
    //   );
    // }
  };

  const handleDeleteWaste = async () => {
    const deletePromises = checkedList.waste.map(async (id) => {
      const idx = outgo.findIndex((el) => el.outgoId === id);
      return await api.patch(`/outgo/update/${id}`, {
        ...outgo[idx],
        outgoTag: outgo[idx].outgoTag.tagName,
        wasteList: false,
      });
    });

    try {
      const responses = await Promise.all(deletePromises);

      const updatedOutgo = [...outgo];
      const updatedWaste = waste.filter(
        (el) => !checkedList.waste.includes(el.outgoId)
      );

      responses.forEach((res) => {
        const idx = updatedOutgo.findIndex(
          (el) => el.outgoId === res.data.outgoId
        );
        updatedOutgo[idx] = res.data;
        console.log(updatedOutgo);
      });

      if (responses.some((res) => res)) {
        const successfulResultsCount = responses.filter(
          (res) => res !== null
        ).length;
        setPageInfoObj((prevPageInfoObj) => ({
          ...prevPageInfoObj,
          waste: {
            ...prevPageInfoObj.waste,
            totalElements:
              prevPageInfoObj.waste.totalElements - successfulResultsCount,
          },
        }));
      }

      setOutgo(updatedOutgo);
      setWaste(updatedWaste);

      const date = getMoment.format("YYYY-MM");
      const customDate = `${date}-00`;

      const res = await api.get(
        `/calendar/ledger?page=1&size=10&date=${customDate}`
      );

      setLedger(res.data.data);

      setIsAllChecked(false);
      setCheckedList({
        income: [],
        outgo: [],
        waste: [],
      });

      dispatch(
        showToast({
          message: "낭비리스트 삭제가 완료되었습니다",
          type: "success",
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onCursorActive = () => {
    const path = location.pathname;
    if (path === "/income") return "false";
    else if (path === "/outgo") return "true";
    else if (path === "/history") {
      return (checkedList.income.length === 0).toString();
    } else {
      return "true";
    }
  };

  // 단일 조회 핸들러
  const handleDateSelect = async (date: string) => {
    // date는 "YYYY-MM-DD" 형식
    try {
      const requests = [
        api.get(`/outgo?page=${activePage}&size=10&date=${date}`),
        api.get(`/income?page=${activePage}&size=10&date=${date}`),
        api.get(`/outgo/wasteList?page=${activePage}&size=10&date=${date}`),
        api.get(`/calendar/ledger?page=${activePage}&size=10&date=${date}`),
      ];

      const responses = await axios.all(requests);

      setOutgo(responses[0].data.data);
      setPageInfoObj((prevPageInfoObj) => ({
        ...prevPageInfoObj,
        outgo: responses[0].data.pageInfo,
      }));
      setIncome(responses[1].data.data);
      setPageInfoObj((prevPageInfoObj) => ({
        ...prevPageInfoObj,
        income: responses[1].data.pageInfo,
      }));
      setWaste(responses[2].data.data);
      setPageInfoObj((prevPageInfoObj) => ({
        ...prevPageInfoObj,
        waste: responses[2].data.pageInfo,
      }));
      setLedger(responses[3].data.data);
      setPageInfoObj((prevPageInfoObj) => ({
        ...prevPageInfoObj,
        combined: responses[3].data.pageInfo,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  // 범위 조회 핸들러
  const handleDateRangeSelect = async (startDate: Moment, endDate: Moment) => {
    try {
      const requests = [
        api.get(
          `/outgo/range?page=${activePage}&size=10&startDate=${startDate.format(
            "YYYY-MM-DD"
          )}&endDate=${endDate.format("YYYY-MM-DD")}`
        ),
        api.get(
          `/income/range?page=${activePage}&size=10&startDate=${startDate.format(
            "YYYY-MM-DD"
          )}&endDate=${endDate.format("YYYY-MM-DD")}`
        ),
        api.get(
          `/outgo/wasteList/range?page=${activePage}&size=10&startDate=${startDate.format(
            "YYYY-MM-DD"
          )}&endDate=${endDate.format("YYYY-MM-DD")}`
        ),
        api.get(
          `/calendar/ledger/range?page=${activePage}&size=10&startDate=${startDate.format(
            "YYYY-MM-DD"
          )}&endDate=${endDate.format("YYYY-MM-DD")}`
        ),
      ];

      const responses = await axios.all(requests);
      console.log(responses);

      setOutgo(responses[0].data.data);
      setPageInfoObj((prevPageInfoObj) => ({
        ...prevPageInfoObj,
        outgo: responses[0].data.pageInfo,
      }));
      setIncome(responses[1].data.data);
      setPageInfoObj((prevPageInfoObj) => ({
        ...prevPageInfoObj,
        income: responses[1].data.pageInfo,
      }));
      setWaste(responses[2].data.data);
      setPageInfoObj((prevPageInfoObj) => ({
        ...prevPageInfoObj,
        waste: responses[2].data.pageInfo,
      }));
      setLedger(responses[3].data.data);
      setPageInfoObj((prevPageInfoObj) => ({
        ...prevPageInfoObj,
        combined: responses[3].data.pageInfo,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const date = getMoment.format("YYYY-MM");
    const customDate = `${date}-00`;

    const fetchData = async () => {
      try {
        const requests = [
          api.get(`/outgo?page=${activePage}&size=10&date=${customDate}`),
          api.get(`/income?page=${activePage}&size=10&date=${customDate}`),
          api.get(
            `/outgo/wasteList?page=${activePage}&size=10&date=${customDate}`
          ),
          api.get(
            `/calendar/ledger?page=${activePage}&size=10&date=${customDate}`
          ),
        ];

        const responses = await axios.all(requests);

        // 개별 요청의 응답을 처리하여 상태를 업데이트합니다.
        setOutgo(responses[0].data.data);
        setPageInfoObj((prevPageInfoObj) => ({
          ...prevPageInfoObj,
          outgo: responses[0].data.pageInfo,
        }));
        setIncome(responses[1].data.data);
        setPageInfoObj((prevPageInfoObj) => ({
          ...prevPageInfoObj,
          income: responses[1].data.pageInfo,
        }));
        setWaste(responses[2].data.data);
        setPageInfoObj((prevPageInfoObj) => ({
          ...prevPageInfoObj,
          waste: responses[2].data.pageInfo,
        }));
        setLedger(responses[3].data.data);
        setPageInfoObj((prevPageInfoObj) => ({
          ...prevPageInfoObj,
          combined: responses[3].data.pageInfo,
        }));
      } catch (error) {
        console.log(error);
      }
    };
    fetchData().catch((error) => {
      console.log(error);
    });
  }, [getMoment, activePage]);

  useEffect(() => {
    const fetchData = async () => {
      const date = getMoment.format("YYYY-MM");
      const customDate = `${date}`;
      try {
        const requests = [
          api.get(`/outgo/monthly?date=${customDate}`),
          api.get(`/income/monthly?date=${customDate}`),
          api.get(`/outgo/wasteList/monthly?date=${customDate}`),
        ];

        const responses = await axios.all(requests);

        // 개별 요청의 응답을 처리하여 상태를 업데이트합니다.
        setSumOutgo(responses[0].data);
        setSumIncome(responses[1].data);
        setSumWasteList(responses[2].data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData().catch((error) => {
      console.log(error);
    });
    setCheckedList({
      income: [],
      outgo: [],
      waste: [],
    });
    setIsAllChecked(false);
  }, [outgo, income, waste]);

  useEffect(() => {
    setCheckedList({
      income: [],
      outgo: [],
      waste: [],
    });
    setIsAllChecked(false);
    setFiltered({
      date: false,
      tag: false,
    });
    setActivePage(1);
  }, [location.pathname, getMoment]);

  return (
    <>
      <Container>
        <h3>가계부 내역</h3>
        <SubHeader>
          <div className="sub__left">
            <DateSelector
              getMoment={getMoment}
              setMoment={setMoment}
              onDateSelect={handleDateSelect}
              onDateRangeSelect={handleDateRangeSelect}
            />
            <button
              className="nowMonth__btn"
              onClick={() => {
                setMoment(moment());
              }}
            >
              이번 달
            </button>
          </div>
          <div className="sub__right">
            <button
              className="write__btn"
              onClick={() => {
                setIsOpen((prev) => {
                  const updated = { ...prev };
                  return { ...updated, writeModal: true };
                });
              }}
            >
              <SvgIcon
                component={CreateOutlinedIcon}
                sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
              />
              <p>가계부 작성하기</p>
            </button>
          </div>
        </SubHeader>
        <MainLists>
          <div className="lists__header">
            <NavStyle to="/history" $isActive={"/history"}>
              <p>{`전체 (${pageInfoObj.combined?.totalElements})`}</p>
              <p className="sum__red">
                {(
                  sumIncome.monthlyTotal - sumOutgo.monthlyTotal
                ).toLocaleString()}{" "}
                원
              </p>
            </NavStyle>
            <NavStyle to="/income" $isActive={"/income"}>
              <p>{`수입 (${pageInfoObj.income?.totalElements})`}</p>
              <p className="sum__blue">
                {sumIncome.monthlyTotal.toLocaleString()} 원
              </p>
            </NavStyle>
            <NavStyle to="/outgo" $isActive={"/outgo"}>
              <p>{`지출 (${pageInfoObj.outgo?.totalElements})`}</p>
              <p className="sum__red">
                {sumOutgo.monthlyTotal.toLocaleString()} 원
              </p>
            </NavStyle>
            <NavStyle to="/waste" $isActive={"/waste"}>
              <p>{`낭비 리스트 (${pageInfoObj.waste?.totalElements})`}</p>
              <p className="sum__green">
                {sumWasteList.monthlyTotal.toLocaleString()} 원
              </p>
            </NavStyle>
          </div>
          {checkedList.income.length > 0 ||
          checkedList.outgo.length > 0 ||
          checkedList.waste.length > 0 ? (
            <div className="category__header__checked">
              <input
                type="checkbox"
                checked={isAllChecked}
                onChange={handleAllChecked}
              />
              <p>{`${
                checkedList.income.length +
                checkedList.outgo.length +
                checkedList.waste.length
              }건이 선택되었습니다.`}</p>
              <p>{sumOfCheckedList().toLocaleString()} 원</p>
              {location.pathname === "/waste" ? (
                <div className="plus__waste" onClick={handleDeleteWaste}>
                  <SvgIcon
                    component={RemoveCircleOutlineOutlinedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                  />
                  <p>낭비 리스트</p>
                </div>
              ) : (
                <WastePlus
                  className="plus__waste"
                  onClick={handleAddWaste}
                  cursor={onCursorActive()}
                >
                  <SvgIcon
                    component={AddCircleOutlineOutlinedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                  />
                  <p>낭비 리스트</p>
                </WastePlus>
              )}
              <div
                className={`delete__list ${
                  location.pathname === "/waste" ? "disable" : ""
                }`}
                onClick={() => {
                  setIsOpen((prev) => {
                    const updated = { ...prev };
                    return { ...updated, deleteModal: true };
                  });
                }}
              >
                <SvgIcon
                  component={DeleteOutlineOutlinedIcon}
                  sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                />
                <p>삭제</p>
              </div>
              <div
                className={`delete__list ${
                  location.pathname === "/waste" ? "disable" : ""
                }`}
                onClick={() => {
                  setIsOpen((prev) => {
                    const updated = { ...prev };
                    return { ...updated, updateModal: true };
                  });
                }}
              >
                <SvgIcon
                  component={CreateOutlinedIcon}
                  sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                />
                <p>수정</p>
              </div>
              <SvgIcon
                className="delete__icon"
                component={ClearOutlinedIcon}
                sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                onClick={() => {
                  setIsAllChecked(false);
                  setCheckedList({
                    income: [],
                    outgo: [],
                    waste: [],
                  });
                }}
              />
            </div>
          ) : (
            <div className="category__header">
              <input
                type="checkbox"
                checked={isAllChecked}
                onChange={handleAllChecked}
              />
              <p>분류</p>
              <p
                onClick={() => {
                  setFiltered((prev) => {
                    const updated = { ...prev };
                    return { ...updated, date: !prev.date };
                  });
                  if (location.pathname === "/income") sortByDate(income);
                  if (location.pathname === "/outgo") sortByDate(outgo);
                  if (location.pathname === "/waste") sortByDate(waste);
                  if (location.pathname === "/history") sortByDate(ledger);
                }}
              >
                날짜
                {filtered.date ? (
                  <SvgIcon
                    className="arrow__up"
                    component={ArrowUpwardRoundedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                  />
                ) : (
                  <SvgIcon
                    className="arrow__up"
                    component={ArrowDownwardRoundedIcon}
                    sx={{ stroke: "#ffffff", strokeWidth: 0.3 }}
                  />
                )}
              </p>
              <p>카테고리</p>
              <p>거래처</p>
              <p>결제수단</p>
              <p>금액</p>
              <p>메모</p>
              {/* <p>영수증</p> */}
            </div>
          )}
          {/* 경로에 따라 다른 컴포넌트를 보여줘야함  */}
          {location.pathname === "/history" && (
            <HistoryList
              sortedArray={ledger}
              checkedList={checkedList}
              checkHandler={checkHandler}
            />
          )}
          {location.pathname === "/income" && (
            <IncomeList
              income={income}
              checkedList={checkedList}
              checkHandler={checkHandler}
            />
          )}
          {location.pathname === "/outgo" && (
            <OutgoList
              outgo={outgo}
              checkedList={checkedList}
              checkHandler={checkHandler}
            />
          )}
          {location.pathname === "/waste" && (
            <WasteList
              waste={waste}
              checkedList={checkedList}
              checkHandler={checkHandler}
            />
          )}
          <PaginationComponent
            totalItemsCount={
              location.pathname === "/outgo"
                ? pageInfoObj.outgo?.totalElements
                : location.pathname === "/income"
                  ? pageInfoObj.income?.totalElements
                  : location.pathname === "/waste"
                    ? pageInfoObj.waste?.totalElements
                    : pageInfoObj.combined?.totalElements
            }
            activePage={activePage}
            itemsPerPage={10}
            handlePageChange={handlePageChange}
          />
        </MainLists>
      </Container>
      {isOpen.writeModal && (
        <LedgerWrite
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setLedger={setLedger}
          setIncome={setIncome}
          setOutgo={setOutgo}
          setPageInfoObj={setPageInfoObj}
          getMoment={getMoment}
        />
      )}
      {isOpen.updateModal && (
        <UpdateModal
          setIsOpen={setIsOpen}
          outgo={outgo}
          income={income}
          checkedList={checkedList}
          setIncome={setIncome}
          setOutgo={setOutgo}
          setWaste={setWaste}
          setLedger={setLedger}
          getMoment={getMoment}
        />
      )}
      {isOpen.deleteModal && (
        <DeleteModal>
          <div className="msg__box">
            <h4>가계부 삭제</h4>
            <p>정말 삭제하시겠습니까?</p>
            <div className="buttons">
              <button
                onClick={() => {
                  setIsOpen((prev) => {
                    const updated = { ...prev };
                    return { ...updated, deleteModal: false };
                  });
                }}
              >
                취소
              </button>
              <button onClick={handleDeleteClick}>확인</button>
            </div>
          </div>
        </DeleteModal>
      )}
    </>
  );
};

export default History;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 3rem 8rem;

  h3 {
    font-size: 2.2rem;
    color: #464656;
  }
`;

const SubHeader = styled.div`
  margin-top: 3rem;
  display: flex;
  justify-content: space-between;

  .sub__left {
    display: flex;
    gap: 2rem;
  }

  .date__div {
    display: flex;

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
      border-top: 1px solid #bebebe;
      border-bottom: 1px solid #bebebe;
      padding: 0.6rem;
      font-size: 1.6rem;
      font-weight: 600;
      color: #464656;
    }
  }

  .nowMonth__btn {
    border: 1px solid #bebebe;
    padding: 0.6rem 1.1rem;
    border-radius: 8px;
    font-weight: 500;
  }

  .write__btn {
    font-size: 1.2rem;
    display: flex;
    gap: 5px;
    padding: 0.8rem 1rem;
    border-radius: 4px;
    color: white;
    background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  }
`;

const MainLists = styled.div`
  width: 100%;
  margin-top: 2.5rem;

  .category__header {
    width: 100%;
    height: 39px;
    border: 1px solid #c7c7c7;
    border-top: none;
    padding: 0 0.8rem;
    display: flex;
    align-items: center;
    gap: 4rem;

    input {
      cursor: pointer;
      width: 1.6rem;
      height: 1.6rem;
      margin-left: 1.5rem;
      margin-right: -0.5rem;
    }

    p {
      font-size: 1.2rem;
      white-space: nowrap;

      &:nth-child(2) {
        width: 4rem;
      }

      &:nth-child(3) {
        width: 8.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
      }

      &:nth-child(5) {
        width: 10rem;
      }

      &:nth-child(7) {
        width: 6rem;
      }

      &:nth-child(8) {
        width: 15rem;
      }
    }

    .arrow__up {
      margin-left: 0.3rem;
    }
  }

  .category__header__checked {
    width: 100%;
    height: 39px;
    border: 1px solid #c7c7c7;
    background: #50506d;
    border-top: none;
    padding: 0 0.8rem;
    display: flex;
    align-items: center;
    color: white;
    gap: 1rem;

    input {
      cursor: pointer;
      width: 1.6rem;
      height: 1.6rem;
      margin-left: 1.5rem;
      margin-right: 2.3rem;
    }

    p {
      font-size: 1.2rem;
      font-weight: 300;
      white-space: nowrap;

      &:nth-child(2) {
        width: 50rem;
      }

      &:nth-child(3) {
        width: 8rem;
        padding-right: 1rem;
        padding-top: 0.5rem;
        height: 2.4rem;
        border-right: 0.5px solid white;
      }
    }

    .plus__waste {
      cursor: pointer;
      display: flex;
      height: 2.4rem;
      align-items: center;
      gap: 4px;
      border-right: 0.5px solid white;

      p {
        width: 7rem;
      }
    }

    .delete__list {
      cursor: pointer;
      display: flex;
      height: 2.4rem;
      align-items: center;
      gap: 4px;
      border-right: 0.5px solid white;

      p {
        width: 3.5rem;
      }
    }

    .disable {
      cursor: not-allowed;
      opacity: 0.4;
      pointer-events: none;
    }

    .delete__icon {
      cursor: pointer;
      margin-left: 1rem;
    }
  }

  .lists__header {
    font-size: 1.6rem; // 반응형
    border-radius: 12px 12px 0px 0px;
    display: flex;
    border: 1px solid #c7c7c7;
  }

  .sum__red {
    color: ${(props) => props.theme.COLORS.LIGHT_RED};
  }

  .sum__blue {
    color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
  }

  .sum__green {
    color: ${(props) => props.theme.COLORS.LIGHT_GREEN};
  }
`;

const NavStyle = styled(NavLink)<{ $isActive: string }>`
  text-align: center;
  flex-grow: 1;
  padding: 1rem;

  p:first-child {
    font-size: 1.2rem;
    color: #9d9d9d;
    margin-bottom: 0.5rem;
  }

  p:last-child {
    font-weight: 600;
  }

  ${(props) =>
    props.$isActive === "/history" || props.$isActive === "/outgo"
      ? css`
          &.active {
            border-bottom: 2px solid ${(props) => props.theme.COLORS.LIGHT_RED};
          }
        `
      : props.$isActive === "/income"
        ? css`
            &.active {
              border-bottom: 2px solid
                ${(props) => props.theme.COLORS.LIGHT_BLUE};
            }
          `
        : css`
            &.active {
              border-bottom: 2px solid
                ${(props) => props.theme.COLORS.LIGHT_GREEN};
            }
          `}
`;

const DeleteModal = styled.div`
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;

  .msg__box {
    width: 36rem;
    height: 20rem;
    background-color: ${(props) => props.theme.COLORS.WHITE};
    border-radius: 1.5rem;
    display: flex;
    flex-direction: column;
    padding: 2.5rem;

    h4 {
      font-size: 2rem;
      color: ${(props) => props.theme.COLORS.LIGHT_BLUE};
      margin-bottom: 1.5rem;
    }

    p {
      font-size: 1.4rem;
      color: #7e7e7e;
    }

    .buttons {
      margin-top: 6rem;
      display: flex;
      justify-content: space-between;
      gap: 2rem;

      button {
        border-radius: 4px;
        color: #7e7e7e;
        padding: 1rem 6rem;
        background: #d9d9d9;

        &:last-child {
          background: ${(props) => props.theme.COLORS.LIGHT_BLUE};
          color: white;
        }

        @media (max-width: 1329px) {
          padding: 1rem 5rem;
        }
      }
    }
  }
`;

const WastePlus = styled.div<{ cursor: string }>`
  cursor: ${(props) =>
    props.cursor === "true" ? "pointer" : "not-allowed"} !important;
  opacity: ${(props) => (props.cursor === "true" ? "1" : "0.4")};
  pointer-events: ${(props) => (props.cursor === "true" ? "auto" : "none")};
  display: flex;
  height: 2.4rem;
  align-items: center;
  gap: 4px;
  border-right: 0.5px solid white;

  p {
    width: 7rem;
  }
`;
