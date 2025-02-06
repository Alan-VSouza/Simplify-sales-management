/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from "react";
import { Box,Button,TextField,Typography,Alert,Link,IconButton,InputAdornment, } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import image from "@components/close-up-picture-gardener-s-hand-holding-sapling-plant.jpg";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("https://localhost:7159/api/User/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setError(error);
        return;
      }

      const { token } = await response.json();
      localStorage.setItem("authToken", token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Usuário não cadastrado.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100vw",
        }}
      >
        <Box
          sx={{
            flex: 1,
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100%",
          }}
        />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            backgroundColor: "#F7F7F7",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 360,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              Faça Login para continuar!
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                marginTop: 2,
              }}
            >
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  "& .MuiInputBase-root": {
                    borderRadius: "8px",
                  },
                }}
              />
              <TextField
                label="Senha"
                type={showPassword ? "text" : "password"} 
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  "& .MuiInputBase-root": {
                    borderRadius: "8px",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
              </Box>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#6A11CB",
                  color: "#fff",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  padding: "10px",
                  "&:hover": {
                    backgroundColor: "#5B0BB5",
                  },
                }}
              >
                Login
              </Button>
            </Box>
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                marginTop: "16px",
                fontSize: "0.9rem",
                color: "#666",
              }}
            >
              Não tem login?{" "}
              <Link
                href="#"
                onClick={() => navigate("/register")}
                sx={{
                  fontSize: "0.9rem",
                  color: "#6A11CB",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Registre-se
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default LoginPage;
