import React from "react";
import { Box, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

// Stable color per category so cards of the same category look related.
const palette = ["#00695c", "#1565c0", "#6a1b9a", "#ef6c00", "#2e7d32", "#ad1457", "#4e342e", "#283593"];

const colorFor = (key: string) => {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
};

interface ProductThumbProps {
  name: string;
  category?: string;
  height?: number;
}

/** Placeholder header for products without a photo: category color + product initial. */
const ProductThumb: React.FC<ProductThumbProps> = ({ name, category = "", height = 120 }) => {
  const color = colorFor(category || name);
  return (
    <Box
      aria-hidden
      sx={{
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2.5,
        color: "#fff",
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
      }}
    >
      <Typography variant="h3" component="span" sx={{ fontWeight: 700, opacity: 0.9 }}>
        {name.trim().charAt(0).toUpperCase() || "?"}
      </Typography>
      <Box textAlign="right">
        <Inventory2OutlinedIcon sx={{ fontSize: 36, opacity: 0.8 }} />
        {category && (
          <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
            {category}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProductThumb;
