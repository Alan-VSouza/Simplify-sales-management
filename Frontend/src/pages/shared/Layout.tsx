/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { connect } from "react-redux";
import { ApplicationState } from "@store/index";
import { CartState } from "@reducers/cart/interface";
import * as CartActions from "@reducers/cart/actions";
import { bindActionCreators } from "redux";
import plantarLogo from "../../components/plantar.png";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { brand } from "../../theme";
import { formatCurrency } from "../../utils/format";

const drawerWidth = 248;

const navSections = [
  {
    label: "Visão geral",
    items: [{ text: "Dashboard", path: "/dashboard", icon: <SpaceDashboardOutlinedIcon /> }],
  },
  {
    label: "Operação",
    items: [
      { text: "Produtos", path: "/product", icon: <Inventory2OutlinedIcon /> },
      { text: "Estoque", path: "/stock", icon: <WarehouseOutlinedIcon /> },
      { text: "Transações", path: "/transaction", icon: <ReceiptLongOutlinedIcon /> },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { text: "Fornecedores", path: "/supplier", icon: <LocalShippingOutlinedIcon /> },
      { text: "Clientes", path: "/client", icon: <PeopleAltOutlinedIcon /> },
    ],
  },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Resultado das vendas e compras da loja" },
  "/product": { title: "Produtos", subtitle: "Catálogo, preços e estoque disponível" },
  "/stock": { title: "Estoque", subtitle: "Entradas e níveis de cada produto" },
  "/transaction": { title: "Transações", subtitle: "Histórico de vendas e compras" },
  "/supplier": { title: "Fornecedores", subtitle: "Quem abastece a loja" },
  "/client": { title: "Clientes", subtitle: "Quem compra com você" },
  "/cart": { title: "Carrinho", subtitle: "Revise os itens e finalize a venda" },
};

const toastOptions = {
  position: "top-right" as const,
  autoClose: 2000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
};

type LayoutProps = {
  cartState: CartState;
  actions: typeof CartActions.actionsCreators;
};

const Layout: React.FC<LayoutProps> = ({ cartState, actions }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { cartItems } = cartState;
  const totalProductsInCart = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalValue = cartItems.reduce((acc, item) => acc + item.salesValue * item.quantity, 0);
  const page = pageTitles[pathname] ?? { title: "Simplify Sales", subtitle: "" };
  const todayRaw = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const today = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);

  const go = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleNavigateToCart = () => {
    setAnchorEl(null);
    navigate("/cart");
  };

  const handleRemoveItem = (id: number) => {
    actions.RemoveFromCart(id);
    toast.info("Produto removido do carrinho.", toastOptions);
  };

  const handleClearCart = () => {
    actions.ClearCart();
    toast.info("Carrinho limpo.", toastOptions);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
    toast.success("Logout realizado com sucesso!", toastOptions);
  };

  const sidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", px: 2, py: 2.5 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        onClick={() => go("/dashboard")}
        sx={{ px: 1, mb: 3, cursor: "pointer" }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "11px",
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(brand.lime, 0.16),
          }}
        >
          <Box component="img" src={plantarLogo} alt="" sx={{ height: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 17, lineHeight: 1.1, color: "#fff" }}>Simplify</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: brand.lime }}>
            SALES
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {navSections.map((section) => (
          <Box key={section.label} sx={{ mb: 2 }}>
            <Typography
              variant="overline"
              sx={{ px: 1.5, fontSize: 10.5, color: alpha("#fff", 0.42), display: "block", mb: 0.5 }}
            >
              {section.label}
            </Typography>
            <List disablePadding>
              {section.items.map((item) => {
                const active = pathname.startsWith(item.path);
                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => go(item.path)}
                    selected={active}
                    sx={{
                      borderRadius: "10px",
                      mb: 0.5,
                      py: 1,
                      color: active ? brand.ink : alpha("#fff", 0.78),
                      "&:hover": { bgcolor: alpha("#fff", 0.07) },
                      "&.Mui-selected, &.Mui-selected:hover": { bgcolor: brand.lime },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 38, color: "inherit", "& svg": { fontSize: 21 } }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: 14.5, fontWeight: active ? 700 : 500 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          mt: 2,
          p: 1.5,
          borderRadius: "14px",
          bgcolor: alpha("#fff", 0.06),
          display: "flex",
          alignItems: "center",
          gap: 1.25,
        }}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: brand.green, fontSize: 15, fontWeight: 700 }}>L</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
            Loja
          </Typography>
          <Typography noWrap sx={{ color: alpha("#fff", 0.55), fontSize: 12 }}>
            Administrador
          </Typography>
        </Box>
        <Tooltip title="Sair">
          <IconButton onClick={handleLogout} size="small" sx={{ color: alpha("#fff", 0.7), "&:hover": { color: "#fff" } }}>
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  const drawerPaper = {
    width: drawerWidth,
    boxSizing: "border-box" as const,
    border: "none",
    backgroundColor: brand.forest,
    backgroundImage: `radial-gradient(120% 60% at 0% 0%, ${alpha(brand.lime, 0.08)} 0%, transparent 60%)`,
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {isDesktop ? (
        <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, "& .MuiDrawer-paper": drawerPaper }}>
          {sidebar}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": drawerPaper }}
        >
          {sidebar}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: theme.zIndex.appBar,
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: { xs: 2, md: 4 },
            py: 2,
            bgcolor: alpha(brand.canvas, 0.85),
            backdropFilter: "saturate(180%) blur(12px)",
            borderBottom: `1px solid ${brand.line}`,
          }}
        >
          {!isDesktop && (
            <IconButton onClick={() => setMobileOpen(true)} edge="start" aria-label="Abrir menu">
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" noWrap>
              {page.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ display: { xs: "none", sm: "block" } }}>
              {page.subtitle}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", lg: "block" } }}
          >
            {today}
          </Typography>
          <Tooltip title="Carrinho">
            <IconButton
              onClick={(event) => setAnchorEl(event.currentTarget)}
              sx={{ bgcolor: "#fff", border: `1px solid ${brand.line}`, "&:hover": { bgcolor: "#fff" } }}
            >
              <Badge badgeContent={totalProductsInCart} color="primary">
                <ShoppingBagOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 360, mt: 1, borderRadius: "16px", border: `1px solid ${brand.line}` } } }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6">Carrinho</Typography>
            <Typography variant="body2" color="text.secondary">
              {totalProductsInCart} {totalProductsInCart === 1 ? "item" : "itens"}
            </Typography>
          </Stack>
          {cartItems.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
              <ShoppingBagOutlinedIcon sx={{ fontSize: 36, opacity: 0.4 }} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Seu carrinho está vazio.
              </Typography>
            </Box>
          ) : (
            <>
              <Stack spacing={1} sx={{ maxHeight: 280, overflowY: "auto" }}>
                {cartItems.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ p: 1, borderRadius: "12px", bgcolor: brand.canvas }}
                  >
                    <Avatar variant="rounded" sx={{ bgcolor: alpha(brand.green, 0.12), color: brand.green, fontWeight: 800 }}>
                      {item.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 700, fontSize: 14 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.quantity} × {formatCurrency(item.salesValue)}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => handleRemoveItem(item.id)} aria-label={`Remover ${item.name}`}>
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography color="text.secondary">Total</Typography>
                <Typography sx={{ fontWeight: 800 }}>{formatCurrency(totalValue)}</Typography>
              </Stack>
              <Button variant="contained" fullWidth size="large" onClick={handleNavigateToCart}>
                Finalizar venda
              </Button>
              <Button fullWidth color="inherit" sx={{ mt: 1, color: "text.secondary" }} onClick={handleClearCart}>
                Limpar carrinho
              </Button>
            </>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  cartState: state.cart,
});

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(CartActions.actionsCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
