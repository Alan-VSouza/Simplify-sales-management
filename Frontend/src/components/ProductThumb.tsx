import React from "react";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { chartPalette } from "../theme";

// Stable color per category so cards of the same category look related.
export const colorFor = (key: string) => {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return chartPalette[hash % chartPalette.length];
};

interface ProductThumbProps {
  name: string;
  category?: string;
  height?: number;
}

/** Placeholder header for products without a photo: soft category tint + product monogram. */
const ProductThumb: React.FC<ProductThumbProps> = ({ name, category = "", height = 112 }) => {
  const color = colorFor(category || name);
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "?";

  return (
    <Box
      aria-hidden
      sx={{
        height,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: `linear-gradient(140deg, ${alpha(color, 0.16)} 0%, ${alpha(color, 0.06)} 100%)`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: "50%",
          right: -50,
          top: -70,
          bgcolor: alpha(color, 0.1),
        }}
      />
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "16px",
          display: "grid",
          placeItems: "center",
          bgcolor: "#fff",
          boxShadow: `0 6px 18px ${alpha(color, 0.25)}`,
          position: "relative",
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: 20, color, letterSpacing: "-0.02em" }}>{initials}</Typography>
      </Box>
    </Box>
  );
};

export default ProductThumb;
