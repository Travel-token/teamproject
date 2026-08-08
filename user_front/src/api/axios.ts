import axios from "axios";

const api = axios.create({

    // 자신의 Spring Boot IP로 변경
    baseURL: "http://172.21.55.74:8080",

    headers: {
        "Content-Type": "application/json",
    },

});

export default api;