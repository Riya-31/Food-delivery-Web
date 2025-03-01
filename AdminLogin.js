import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminLogin.css";
import { BASE_URL } from '../config';
import { Visibility, VisibilityOff } from "@mui/icons-material";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const navigate = useNavigate(); // Initialize navigate hook

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch(`${BASE_URL}/api/admin/loginAdmin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || "An error occurred during login.");
                return;
            }

            const data = await response.json();
            setSuccessMessage(data.message);

            // Navigate to AdminHomePage on successful login
            navigate("/adminHomePage");
        } catch (err) {
            setError("Unable to connect to the server. Please try again later.");
            console.error("Login error:", err);
        }
    };

    return (
        <div className="wrapperBody">
            <div className="wrapper">
                <div className="logo">
                    <img src="/admin.png" alt="Admin Image" />
                </div>
                <div className="text-center mt-4 name">Admin Login</div>
                <form className="p-3 mt-3" onSubmit={handleLogin}>
                    {error && <p className="errorMessage">{error}</p>}
                    {successMessage && <p className="successMessage">{successMessage}</p>}

                    <div className="form-field d-flex align-items-center">
                        <span className="far fa-user"></span>
                        <input type="email" name="email" id="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    {/* Password Input Field with Icon */}
                    <div className="form-field password-field">
                        <input type={showPassword ? "text" : "password"}
                            name="password" id="pwd" placeholder="Enter your password"
                            value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <span className="password-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </span>
                    </div>

                    <button className="btn mt-3">Login</button>
                </form>
                {/* <div className="text-center fs-6">
                    <a href="#">Forget password?</a> or <a href="#">Sign up</a>
                </div> */}
            </div>
        </div>
    );
};

export default AdminLogin;
