/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Box, Button,TextField,Typography,Alert,Link,IconButton,InputAdornment, } from "@mui/material";
import { motion } from "framer-motion";
import image from "@components/Register.jpg";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

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

      const response = await fetch("https://localhost:7159/api/User/Register", {
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
              variant="h4"
              sx={{
                fontWeight: "bold",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              Cadastre-se
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && (
              <Alert severity="success">Cadastro realizado com sucesso!</Alert>
            )}
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
                label="Nome"
                name="name"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                sx={{
                  "& .MuiInputBase-root": {
                    borderRadius: "8px",
                  },
                }}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                sx={{
                  "& .MuiInputBase-root": {
                    borderRadius: "8px",
                  },
                }}
              />
              <TextField
                label="Senha"
                name="password"
                type={showPassword ? "text" : "password"} 
                fullWidth
                value={formData.password}
                onChange={handleChange}
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
                Registrar
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
              Já tem uma conta? Faça{" "}
              <Link
                href="/login"
                sx={{
                  fontSize: "0.9rem",
                  color: "#6A11CB",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default RegisterPage;
