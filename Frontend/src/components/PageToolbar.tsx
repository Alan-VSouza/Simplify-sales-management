import React from "react";
import { Box, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { brand } from "../theme";

interface PageToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  placeholder: string;
  onRefresh?: () => void;
  /** Filters shown next to the search field. */
  filters?: React.ReactNode;
  /** Primary actions, aligned to the right. */
  children?: React.ReactNode;
}

/** Shared toolbar for list pages: always-visible search, optional filters, refresh and actions. */
const PageToolbar: React.FC<PageToolbarProps> = ({ search, onSearch, placeholder, onRefresh, filters, children }) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 1.5,
      mb: 3,
    }}
  >
    <TextField
      size="small"
      placeholder={placeholder}
      value={search}
      onChange={(e) => onSearch(e.target.value)}
      sx={{ width: { xs: "100%", sm: 320 } }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon sx={{ color: "text.secondary" }} />
          </InputAdornment>
        ),
      }}
    />
    {filters}
    <Box sx={{ flex: 1 }} />
    {onRefresh && (
      <Tooltip title="Atualizar">
        <IconButton onClick={onRefresh} sx={{ bgcolor: "#fff", border: `1px solid ${brand.line}` }} aria-label="Atualizar">
          <RefreshRoundedIcon />
        </IconButton>
      </Tooltip>
    )}
    {children}
  </Box>
);

export default PageToolbar;
