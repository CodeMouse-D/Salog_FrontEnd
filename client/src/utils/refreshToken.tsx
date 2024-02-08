import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie, removeCookie, setCookie } from "./cookie";

export const api = axios.create({
	baseURL: process.env.REACT_APP_SERVER_URL,
	headers: { "Content-Type": "application/json" },
});

const RefreshToken = () => {
	const navigate = useNavigate();
	useEffect(() => {
		// 요청 전에 헤더에 accessToken을 추가
		api.interceptors.request.use((config) => {
			const accessToken = getCookie("accessToken");
			config.headers.Authorization = `${accessToken}`;
			config.withCredentials = true;
			return config;
		});

		// 에러 처리 및 accessToken 재발급
		api.interceptors.response.use(
			(response) => response,
			async (error) => {
				if (error.response.status === 401) {
					const refreshToken = getCookie("refreshToken");
					const accessToken = localStorage.getItem("accessToken");
					const current = new Date();
					current.setMinutes(current.getMinutes() + 30);

					try {
						const response = await axios.post(
							`${process.env.REACT_APP_SERVER_URL}/refresh`,
							{
								accessToken,
								refreshToken,
							},
						);
						console.log("응답 핸들링", response);

						const newAccessToken = response.data.accessToken;
						setCookie("accessToken", newAccessToken, {
							path: "/",
							expires: current,
						});
						localStorage.setItem("accessToken", newAccessToken);

						// 이전 요청을 재시도
						return await api.request(error.config);
					} catch (error) {
						console.log("토큰 재발급 실패:", error);
						// refreshToken 재발급에 실패한 경우 로그아웃 처리 등을 수행할 수 있습니다.
						removeCookie("refreshToken", { path: "/" });
						removeCookie("accessToken", { path: "/" });
						navigate("/login", { replace: true });
					}
				}

				return await Promise.reject(error);
			},
		);
	}, []);
	return <></>;
};

export default RefreshToken;
