import { alpha, createTheme } from "@mui/material/styles";

/**
 * Visual identity: deep forest green (the "Plantar" brand) with a fresh lime
 * accent, warm off-white surfaces and a single geometric sans-serif.
 */
export const brand = {
  ink: "#0f1f17",
  forest: "#0d2b20",
  forestSoft: "#14382a",
  green: "#1f7a4d",
  lime: "#b8e986",
  canvas: "#f4f5f1",
  line: "#e3e6df",
  muted: "#66736b",
};

/** Colors for charts and category accents, chosen to sit well together. */
export const chartPalette = ["#1f7a4d", "#7cc58f", "#e0a73a", "#3d7ea6", "#c2603f", "#8a6fb8"];

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: brand.green, dark: "#17603c", light: "#4f9b74", contrastText: "#ffffff" },
    secondary: { main: brand.forest, contrastText: "#ffffff" },
    success: { main: "#2f9e5b" },
    warning: { main: "#d9902b" },
    error: { main: "#d1495b" },
    info: { main: "#3d7ea6" },
    background: { default: brand.canvas, paper: "#ffffff" },
    text: { primary: brand.ink, secondary: brand.muted },
    divider: brand.line,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontWeight: 800, letterSpacing: "-0.02em" },
    h4: { fontWeight: 800, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 700, textTransform: "none", letterSpacing: 0 },
    overline: { fontWeight: 700, letterSpacing: "0.08em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: brand.canvas },
        "::selection": { backgroundColor: alpha(brand.green, 0.18) },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 16 },
        sizeSmall: { paddingInline: 12 },
        outlined: { borderColor: brand.line },
      },
    },
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 16 } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${brand.line}`,
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(15,31,23,0.04)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 20 } },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontWeight: 800, fontSize: "1.25rem" } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#fff",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: brand.line },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#c4cbc1" },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#f8f9f6",
            color: brand.muted,
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: { root: { borderColor: brand.line } },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { backgroundColor: brand.ink, fontSize: "0.75rem", borderRadius: 8 } },
    },
  },
});

export default theme;
