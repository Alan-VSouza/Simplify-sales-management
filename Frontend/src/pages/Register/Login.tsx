/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from "react";
import { Box, Button, TextField, Typography, Alert, Link, IconButton, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@components/AuthLayout";
import image from "@components/close-up-picture-gardener-s-hand-holding-sapling-plant.jpg";
import Visibility from "@mui/icons-material/VisibilityOutlined";
import VisibilityOff from "@mui/icons-material/VisibilityOffOutlined";
import { API_URL } from "../../config/api";

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
      const response = await fetch(`${API_URL}/api/User/Login`, {
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
    <AuthLayout image={image} title="Bem-vindo de volta" subtitle="Entre com seu e-mail e senha para acessar o painel.">
      {error && <Alert severity="error">{error}</Alert>}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginTop: 3,
        }}
      >
        <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField
          label="Senha"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        <Button type="submit" variant="contained" size="large" sx={{ py: 1.4, mt: 1 }}>
          Entrar
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3 }}>
        Não tem login?{" "}
        <Link href="#" onClick={() => navigate("/register")} sx={{ fontWeight: 700 }}>
          Registre-se
        </Link>
      </Typography>
    </AuthLayout>
  );
};

export default LoginPage;
