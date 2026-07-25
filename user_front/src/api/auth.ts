import api from "./axios";


export const devLogin = async (email: string) => {

    const response = await api.post(

        "/api/auth/dev-login",

        {
            email,
        }

    );

    return response.data;

};