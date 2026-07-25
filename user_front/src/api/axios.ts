import axios from "axios";

const api = axios.create({

    // 자신의 Spring Boot IP로 변경
    baseURL: "http://192.168.56.1:8080",

    headers: {
        "Content-Type": "application/json",
    },

});

export default api;