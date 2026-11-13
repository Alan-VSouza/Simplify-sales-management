/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */

import React, { useEffect, useState } from "react";
import { Typography, Grid, Card, CardContent, Box, Chip, IconButton, TextField, Tooltip, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress } from "@mui/material";
import PageToolbar from "../../components/PageToolbar";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCartRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { alpha } from "@mui/material/styles";
import ProductRegisterModal from "./ProductRegisterModal";
import ProductThumb from "../../components/ProductThumb";
import { formatCurrency } from "../../utils/format";
import { connect, ConnectedProps } from "react-redux";
import { ApplicationState } from "@store/index";
import { bindActionCreators } from "redux";
import * as ProductReducer from "@reducers/products";
import * as CartReducer from "@reducers/cart";
import { ICartProduct } from "@reducers/cart";
import { IProduct } from "@reducers/products";

const LOW_STOCK_THRESHOLD = 15;

const connector = connect(
  (state: ApplicationState) => ({
    productsState: state.products,
    cartState: state.cart,
  }),
  (dispatch) => ({
    actions: {
      products: bindActionCreators(ProductReducer.actionsCreators, dispatch),
      cart: bindActionCreators(CartReducer.actionsCreators, dispatch),
    },
  })
);

type PropsFromRedux = ConnectedProps<typeof connector>;



const Product: React.FC<PropsFromRedux> = ({ productsState, actions }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddToCartDialogOpen, setAddToCartDialogOpen] = useState(false);
  const [quantityToAddToCart, setQuantityToAddToCart] = useState("");
  const [isCartTouched, setIsCartTouched] = useState(false);

  useEffect(() => {
    actions.products.GetAll();
  }, [actions.products]);

  const handleOpenModal = (product: IProduct | null = null) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = async () => {
    setSelectedProduct(null);
    setModalOpen(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); 
      actions.products.GetAll(true);
    } catch (error) {
      console.error("Erro ao recarregar os produtos:", error);
    }
  };

  const handleOpenAddToCartDialog = (product: IProduct) => {
    setSelectedProduct(product);
    setAddToCartDialogOpen(true);
    setQuantityToAddToCart("");
    setIsCartTouched(false);
  };

  const handleCloseAddToCartDialog = () => {
    setSelectedProduct(null);
    setAddToCartDialogOpen(false);
    setQuantityToAddToCart("");
    setIsCartTouched(false);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast.error("Produto não selecionado.");
      return;
    }

    const quantityNumber = parseInt(quantityToAddToCart, 10);

    if (isNaN(quantityNumber) || quantityNumber <= 0) {
      toast.error("Insira uma quantidade válida maior que zero.");
      return;
    }

    if (quantityNumber > selectedProduct.quantity) {
      toast.error(`A quantidade não pode exceder o estoque disponível (${selectedProduct.quantity}).`);
      return;
    }

    const cartProduct: ICartProduct = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      type: selectedProduct.type,
      category: selectedProduct.category,
      brand: selectedProduct.brand,
      quantity: quantityNumber,
      salesValue: selectedProduct.salesValue,
    };

    actions.cart.AddToCart(cartProduct);
    toast.success(`${selectedProduct.name} foi adicionado ao carrinho!`);
    handleCloseAddToCartDialog();
  };

  const handleDeleteProduct = (id: number, name: string) => {
    toast(
      ({ closeToast }) => (
        <Box>
          <Typography>Tem certeza que deseja excluir o produto "{name}"?</Typography>
          <Box display="flex" gap={1} mt={2}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                actions.products.Delete(id);
                toast.success("Produto excluído com sucesso!");
                closeToast();
              }}
            >
              Confirmar
            </Button>
            <Button variant="outlined" onClick={closeToast}>
              Cancelar
            </Button>
          </Box>
        </Box>
      ),
      { autoClose: false }
    );
  };

  const handleRefresh = () => {
    toast.info("Recarregando produtos...");
    actions.products.GetAll(true);
  };

  const filteredProducts = productsState.products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <ToastContainer />
      <PageToolbar
        search={searchQuery}
        onSearch={setSearchQuery}
        placeholder="Pesquisar produtos..."
        onRefresh={handleRefresh}
      >
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => handleOpenModal(null)}>
          Novo produto
        </Button>
      </PageToolbar>

      {productsState.getAllStatus === "loading" ? (
        <LinearProgress sx={{ borderRadius: 4 }} />
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                component={motion.div}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.15 }}
                sx={{
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  transition: "box-shadow 0.2s ease",
                  "&:hover": { boxShadow: "0 12px 28px rgba(15,31,23,0.08)" },
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <ProductThumb name={product.name} category={product.category} />
                  {product.category && (
                    <Chip
                      label={product.category}
                      size="small"
                      sx={{ position: "absolute", top: 12, left: 12, bgcolor: "rgba(255,255,255,0.85)", fontSize: 12 }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {product.brand || "Sem marca"}
                  </Typography>
                  <Box display="flex" alignItems="flex-end" justifyContent="space-between" mt={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Preço de venda
                      </Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>
                        {formatCurrency(product.salesValue)}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={product.quantity <= 0 ? "Sem estoque" : `${product.quantity} em estoque`}
                      sx={(theme) => {
                        const tone =
                          product.quantity <= 0
                            ? theme.palette.error.main
                            : product.quantity <= LOW_STOCK_THRESHOLD
                            ? theme.palette.warning.main
                            : theme.palette.success.main;
                        return { bgcolor: alpha(tone, 0.12), color: tone };
                      }}
                    />
                  </Box>
                </CardContent>
                <Box sx={{ px: 2, pb: 2, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Tooltip title="Editar">
                    <IconButton size="small" aria-label={`Editar ${product.name}`} onClick={() => handleOpenModal(product)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      size="small"
                      aria-label={`Excluir ${product.name}`}
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      sx={{ "&:hover": { color: "error.main" } }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Button
                    startIcon={<AddShoppingCartIcon />}
                    variant="contained"
                    size="small"
                    sx={{ ml: "auto" }}
                    disabled={product.quantity <= 0}
                    onClick={() => handleOpenAddToCartDialog(product)}
                  >
                    Vender
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ProductRegisterModal open={isModalOpen} onClose={handleCloseModal} product={selectedProduct} />

      <Dialog open={isAddToCartDialogOpen} onClose={handleCloseAddToCartDialog}>
        <DialogTitle>Adicionar ao Carrinho</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Quantos itens deseja adicionar ao carrinho de "{selectedProduct?.name}"?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="quantityToCart"
            label="Quantidade"
            type="number"
            fullWidth
            variant="outlined"
            value={quantityToAddToCart}
            onChange={(e) => {
              setQuantityToAddToCart(e.target.value);
              setIsCartTouched(true); 
            }}
            onBlur={() => {
              if (quantityToAddToCart.trim() === '') {
                setQuantityToAddToCart('0');
                setIsCartTouched(false);
              }
            }}
            InputProps={{ inputProps: { min: 1, max: selectedProduct?.quantity || 1 } }} 
            error={
              isCartTouched &&
              (isNaN(parseInt(quantityToAddToCart, 10)) ||
                parseInt(quantityToAddToCart, 10) <= 0 ||
                parseInt(quantityToAddToCart, 10) > (selectedProduct?.quantity || 1))
            }
            helperText={
              isCartTouched &&
              (isNaN(parseInt(quantityToAddToCart, 10)) ||
                parseInt(quantityToAddToCart, 10) <= 0)
                ? "Insira uma quantidade válida maior que zero."
                : isCartTouched &&
                  parseInt(quantityToAddToCart, 10) > (selectedProduct?.quantity || 1)
                ? `A quantidade não pode exceder o estoque disponível (${selectedProduct?.quantity}).`
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddToCartDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleAddToCart} color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default connector(Product);
