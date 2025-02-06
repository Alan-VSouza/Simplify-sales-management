/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box,Typography,Drawer,List,ListItemButton,ListItemIcon,ListItemText,Divider,AppBar,Toolbar,IconButton,Badge,Popover,Card,CardContent,CardMedia,Button,} from "@mui/material";
import { motion } from "framer-motion";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import { Icon } from "@iconify/react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { connect } from "react-redux";
import { ApplicationState } from "@store/index";
import { CartState } from "@reducers/cart/interface";
import * as CartActions from "@reducers/cart/actions";
import { bindActionCreators } from "redux";
import productImage from "../../components/Produto.jpg";
import plantarLogo from "../../components/plantar.png"; 
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

const drawerWidth = 240;

const navItems = [
  { text: "Dashboard", path: "/dashboard", icon: <Icon icon="ic:round-dashboard" width={25} height={25} /> },
  { text: "Produtos", path: "/product", icon: <Icon icon="fluent-mdl2:product" width={25} height={25} /> },
  { text: "Estoque", path: "/stock", icon: <Icon icon="fluent-mdl2:product-variant" width={25} height={25} /> },
  { text: "Transações", path: "/transaction", icon: <Icon icon="mdi:cube-send" width={25} height={25} /> },
  { text: "Fornecedores", path: "/supplier", icon: <LocalShippingIcon sx={{ fontSize: 25 }} /> },
  { text: "Clientes", path: "/client", icon: <AccountCircleIcon sx={{ fontSize: 25 }} /> },
];

type LayoutProps = {
  cartState: CartState;
  actions: typeof CartActions.actionsCreators;
};

const Layout: React.FC<LayoutProps> = ({ cartState, actions }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { cartItems } = cartState;
  const isPopoverOpen = Boolean(anchorEl);

  const totalProductsInCart = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalValue = cartItems.reduce((acc, item) => acc + item.salesValue * item.quantity, 0);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleNavigateToCart = () => {
    handleClosePopover();
    navigate("/cart");
  };

  const handleRemoveItem = (id: number) => {
    actions.RemoveFromCart(id);
    toast.info("Produto removido do carrinho.", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "colored",
    });
  };

  const handleClearCart = () => {
    actions.ClearCart();
    toast.info("Carrinho limpo.", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "colored",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
    toast.success("Logout realizado com sucesso!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "colored",
    });
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#004c4c",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              onClick={() => navigate("/dashboard")} 
              sx={{
                cursor: 'pointer', 
              }}
            >
              Menu
            </Typography>
            <Box
              component="img"
              src={plantarLogo}
              alt="Logo Plantar"
              sx={{
                height: 30, 
                width: "auto", 
                marginLeft: 1, 
              }}
            />
          </Box>

          <IconButton color="inherit" onClick={handleOpenPopover}>
            <Badge badgeContent={totalProductsInCart} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          <Popover
            open={isPopoverOpen}
            anchorEl={anchorEl}
            onClose={handleClosePopover}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            sx={{
              "& .MuiPopover-paper": {
                width: 360,
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Carrinho
              </Typography>
              {cartItems.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                  Seu carrinho está vazio.
                </Typography>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <Card
                      key={item.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                        p: 1,
                        boxShadow: "none",
                        border: "1px solid #ddd",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={productImage}
                        alt={item.name}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          objectFit: "cover",
                        }}
                      />
                      <CardContent
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          ml: 2,
                          padding: 0,
                        }}
                      >
                        <Typography variant="subtitle1">{item.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          R$ {item.salesValue.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Quantidade: {item.quantity}
                        </Typography>
                      </CardContent>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(item.id)}
                        sx={{ padding: "4px" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Card>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Total: R$ {totalValue.toFixed(2)}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleNavigateToCart}
                  >
                    Finalizar Compra
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={handleClearCart}
                  >
                    Limpar Carrinho
                  </Button>
                </>
              )}
            </Box>
          </Popover>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#004c4c",
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "64px",
            }}
          >
            <Typography variant="h6" noWrap>
              Dashboard
            </Typography>
          </Box>
          <Divider />
          <List>
            {navItems.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "#006666",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "#FFFFFF" }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </motion.div>
            ))}
          </List>
        </Box>

        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            onClick={handleLogout}
            sx={{
              backgroundColor: "#E53935",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: "#C62828",
              },
              width: 48,
              height: 48,
            }}
          >
            <LogoutIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#ffff",
          p: 4,
          marginLeft: `0px`,
          marginTop: `64px`,
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Box>
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
