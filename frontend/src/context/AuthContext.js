import React, { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await API.post("/auth/login", { email, password });
        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data);
    };

    const register = async (name, email, password) => {
        await API.post("/auth/register", { name, email, password });
    };

    const updatePhoto = async (formData) => {
        const { data } = await API.put("/auth/profile/photo", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        localStorage.setItem("userInfo", JSON.stringify(data));
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem("userInfo");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, updatePhoto, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
