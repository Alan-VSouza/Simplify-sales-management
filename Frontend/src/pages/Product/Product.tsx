/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */

import React, { useEffect, useState } from "react";
import { Typography,Grid,Card,CardContent,CardMedia,Box,IconButton,TextField,Button,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,LinearProgress, } from "@mui/material";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SyncIcon from "@mui/icons-material/Sync";
import SearchIcon from "@mui/icons-material/Search";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/system";
import ProductRegisterModal from "./ProductRegisterModal";
import productImage from "../../components/Produto.jpg";
import { connect, ConnectedProps } from "react-redux";
import { ApplicationState } from "@store/index";
import { bindActionCreators } from "redux";
import * as ProductReducer from "@reducers/products";
import * as CartReducer from "@reducers/cart";
import { ICartProduct } from "@reducers/cart";
import { IProduct } from "@reducers/products";

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

const SearchBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  transition: "all 0.4s ease",
  ".searchBox": {
    overflow: "hidden",
    maxWidth: 0,
    opacity: 0,
    transition: "max-width 0.4s ease, opacity 0.4s ease",
  },
  ".searchBox.expand": {
    maxWidth: 200,
    opacity: 1,
  },
}));

const MotionCard = styled(motion(Card))(({ theme }) => ({
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.2)",
  },
}));

const Product: React.FC<PropsFromRedux> = ({ productsState, cartState, actions }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setSearchExpanded] = useState(false);
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

  const handleToggleSearch = () => setSearchExpanded((prev) => !prev);

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <ToastContainer />
      <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            gap: 3,
          }}
        >
        <Typography variant="h4" color="#000000" fontWeight="bold">
          Produtos
        </Typography>
        <SearchBox>
          <Box className={`searchBox ${isSearchExpanded ? "expand" : ""}`}>
            <TextField
              placeholder="Pesquisar produtos..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>
          <IconButton onClick={handleToggleSearch}>
            <SearchIcon />
          </IconButton>
          <Button variant="contained" color="primary" onClick={() => handleOpenModal(null)}>
            Cadastrar Produto
          </Button>
          <IconButton onClick={handleRefresh}>
            <SyncIcon />
          </IconButton>
        </SearchBox>
      </Box>

      {productsState.getAllStatus === "loading" ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={3} sm={3} md={3} key={product.id}> 
              <MotionCard
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                sx={{
                  boxShadow: 4,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  image={productImage}
                  alt={product.name}
                  sx={{ borderRadius: "8px 8px 0 0", height: 150, objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2">Categoria: {product.category}</Typography>
                  <Typography variant="body2">Marca: {product.brand}</Typography>
                  <Typography variant="body1" color="primary">
                    Preço: R$ {product.salesValue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">Estoque: {product.quantity}</Typography>
                </CardContent>
                <Box sx={{ p: 2, display: "flex", gap: 1 }}>
                  <Button
                    startIcon={<EditIcon />}
                    variant="contained"
                    color="warning"
                    onClick={() => handleOpenModal(product)}
                  >
                    Editar
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                  >
                    Excluir
                  </Button>
                  <Button
                    startIcon={<AddShoppingCartIcon />}
                    variant="contained"
                    color="success"
                    onClick={() => handleOpenAddToCartDialog(product)} 
                  >
                    Adicionar
                  </Button>
                </Box>
              </MotionCard>
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
