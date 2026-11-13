/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Box, Button, TextField, Typography, Alert, Link, IconButton, InputAdornment } from "@mui/material";
import AuthLayout from "@components/AuthLayout";
import image from "@components/Register.jpg";
import Visibility from "@mui/icons-material/VisibilityOutlined";
import VisibilityOff from "@mui/icons-material/VisibilityOffOutlined";
import { API_URL } from "../../config/api";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        PasswordHash: formData.password,
      };

      const response = await fetch(`${API_URL}/api/User/Register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setError(error);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError("Erro ao registrar. Tente novamente mais tarde.");
    }
  };

  return (
    <AuthLayout image={image} title="Crie sua conta" subtitle="Leva menos de um minuto para começar a usar.">
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Cadastro realizado com sucesso!</Alert>}
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
        <TextField label="Nome" name="name" fullWidth value={formData.name} onChange={handleChange} />
        <TextField label="Email" name="email" type="email" fullWidth value={formData.email} onChange={handleChange} />
        <TextField
          label="Senha"
          name="password"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={formData.password}
          onChange={handleChange}
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
          Criar conta
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3 }}>
        Já tem uma conta?{" "}
        <Link href="/login" sx={{ fontWeight: 700 }}>
          Entrar
        </Link>
      </Typography>
    </AuthLayout>
  );
};

export default RegisterPage;
