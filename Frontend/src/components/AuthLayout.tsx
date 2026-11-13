import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import plantarLogo from "./plantar.png";
import { brand } from "../theme";

interface AuthLayoutProps {
  image: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const highlights = [
  "Vendas, compras e estoque no mesmo lugar",
  "Indicadores de faturamento e margem em tempo real",
  "Cadastro de clientes e fornecedores",
];

/** Split screen used by login and sign-up: brand story on the left, form on the right. */
const AuthLayout: React.FC<AuthLayoutProps> = ({ image, title, subtitle, children }) => (
  <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
    <Box
      sx={{
        flex: 1.1,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "space-between",
        p: 5,
        color: "#fff",
        backgroundImage: `linear-gradient(180deg, ${alpha(brand.forest, 0.55)} 0%, ${alpha(brand.forest, 0.92)} 75%), url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Box sx={{ width: 40, height: 40, borderRadius: "12px", display: "grid", placeItems: "center", bgcolor: alpha("#fff", 0.14) }}>
          <Box component="img" src={plantarLogo} alt="" sx={{ height: 24 }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
          Simplify <Box component="span" sx={{ color: brand.lime }}>Sales</Box>
        </Typography>
      </Stack>

      <Box sx={{ maxWidth: 460 }}>
        <Typography sx={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          A gestão da sua loja, simples do caixa ao estoque.
        </Typography>
        <Stack spacing={1.25} sx={{ mt: 3 }}>
          {highlights.map((text) => (
            <Stack key={text} direction="row" spacing={1.25} alignItems="center">
              <CheckCircleRoundedIcon sx={{ color: brand.lime, fontSize: 20 }} />
              <Typography sx={{ color: alpha("#fff", 0.85) }}>{text}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>

    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, sm: 6 } }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        sx={{ width: "100%", maxWidth: 400 }}
      >
        <Typography variant="h4">{title}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          {subtitle}
        </Typography>
        {children}
      </Box>
    </Box>
  </Box>
);

export default AuthLayout;
