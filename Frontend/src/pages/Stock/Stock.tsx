/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */

import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  TableSortLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import PageToolbar from "../../components/PageToolbar";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductRegisterModal from "@pages/Product/ProductRegisterModal";
import { colorFor } from "../../components/ProductThumb";
import { formatCurrency } from "../../utils/format";
import { alpha } from "@mui/material/styles";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { Avatar, Card, Chip, IconButton, LinearProgress, Stack, Tooltip } from "@mui/material";

const LOW_STOCK = 15;
const stockColumns: { key: string; label: string; align: "left" | "right" }[] = [
  { key: "name", label: "Produto", align: "left" },
  { key: "category", label: "Categoria", align: "left" },
  { key: "salesValue", label: "Preço", align: "right" },
  { key: "quantity", label: "Estoque", align: "left" },
];
import { connect, ConnectedProps } from "react-redux";
import { ApplicationState } from "@store/index";
import { bindActionCreators } from "redux";
import * as StockActions from "@reducers/stock/actions";

const connector = connect(
  (state: ApplicationState) => ({
    stockState: state.stock,
  }),
  (dispatch) => ({
    actions: bindActionCreators(StockActions.actionsCreators, dispatch),
  }),
);

type PropsFromRedux = ConnectedProps<typeof connector>;

const StockPage: React.FC<PropsFromRedux> = ({ stockState, actions }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof (typeof stockState.stockItems)[0]>("name");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  useEffect(() => {
    actions.GetAllStock();
  }, [actions]);

  const handleRequestSort = (property: keyof (typeof stockState.stockItems)[0]) => {
    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);
  };
  const handleOpenAddDialog = (product: any) => {
    setSelectedProduct(product);
    setAddDialogOpen(true);
    setQuantityToAdd("");
    setIsTouched(false);
  };

  const handleAddToStock = async () => {
    if (!selectedProduct) {
      toast.error("Produto não selecionado.", { position: "top-right", autoClose: 3000 });
      return;
    }

    const quantityNumber = parseInt(quantityToAdd, 10);

    if (isNaN(quantityNumber) || quantityNumber <= 0) {
      toast.error("Insira uma quantidade válida maior que zero.", { position: "top-right", autoClose: 3000 });
      return;
    }

    try {
      const updatedQuantity = selectedProduct.quantity + quantityNumber;
      await actions.UpdateStock(selectedProduct.id, { ...selectedProduct, quantity: updatedQuantity });

      toast.success(`Estoque de ${selectedProduct.name} atualizado com sucesso!`, {
        position: "top-right",
        autoClose: 3000,
      });

      setAddDialogOpen(false);
      setQuantityToAdd("");
      setIsTouched(false);
      actions.GetAllStock();
    } catch (error) {
      toast.error("Erro ao atualizar o estoque.", { position: "top-right", autoClose: 3000 });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await actions.DeleteProduct(productId);
      toast.success("Produto excluído com sucesso.", { position: "top-right", autoClose: 3000 });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao excluir o produto.", { position: "top-right", autoClose: 3000 });
    }
  };

  const handleRegisterTransaction = () => {
    setRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setRegisterModalOpen(false);
    actions.GetAllStock();
  };

  const handleRefreshStock = () => {
    actions.GetAllStock();
    toast.info("Estoque atualizado!", { position: "top-right", autoClose: 2000 });
  };

  const filteredProducts = stockState.stockItems
    .filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (orderBy === "quantity" || orderBy === "salesValue") {
        return order === "asc" ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
      }
      const comparison = String(a[orderBy]).localeCompare(String(b[orderBy]), "pt-BR");
      return order === "asc" ? comparison : -comparison;
    });

  const maxQuantity = Math.max(...filteredProducts.map((p) => p.quantity), 1);

  return (
    <Box>
      <ToastContainer />
      <PageToolbar
        search={searchQuery}
        onSearch={setSearchQuery}
        placeholder="Pesquisar produtos..."
        onRefresh={handleRefreshStock}
      >
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleRegisterTransaction}>
          Cadastrar produto
        </Button>
      </PageToolbar>

      <Card sx={{ overflow: "hidden" }}>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                {stockColumns.map(({ key, label, align }) => (
                  <TableCell key={key} align={align} sx={{ whiteSpace: "nowrap" }}>
                    <TableSortLabel
                      active={orderBy === key}
                      direction={orderBy === key ? order : "asc"}
                      onClick={() => handleRequestSort(key as keyof (typeof stockState.stockItems)[0])}
                    >
                      {label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => {
                const color = colorFor(product.category || product.name);
                const level = Math.min(product.quantity / maxQuantity, 1);
                const tone = product.quantity <= 0 ? "error" : product.quantity <= LOW_STOCK ? "warning" : "success";
                return (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: 38,
                            height: 38,
                            fontSize: 14,
                            fontWeight: 800,
                            bgcolor: alpha(color, 0.14),
                            color,
                          }}
                        >
                          {product.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{product.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.brand || "Sem marca"} · {product.type}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={product.category || "-"} sx={{ bgcolor: alpha(color, 0.1), color }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                      {formatCurrency(product.salesValue)}
                    </TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <LinearProgress
                          variant="determinate"
                          value={level * 100}
                          color={tone}
                          sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: alpha(color, 0.08) }}
                        />
                        <Typography sx={{ fontWeight: 700, fontSize: 14, minWidth: 32, textAlign: "right" }}>
                          {product.quantity}
                        </Typography>
                      </Stack>
                      {product.quantity <= LOW_STOCK && (
                        <Typography variant="caption" color={`${tone}.main`} sx={{ fontWeight: 600 }}>
                          {product.quantity <= 0 ? "Sem estoque" : "Estoque baixo"}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddRoundedIcon />}
                        onClick={() => handleOpenAddDialog(product)}
                      >
                        Entrada
                      </Button>
                      <Tooltip title="Excluir produto">
                        <IconButton
                          size="small"
                          sx={{ ml: 0.5, "&:hover": { color: "error.main" } }}
                          aria-label={`Excluir ${product.name}`}
                          onClick={() => {
                            setSelectedProduct(product);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <Dialog open={isAddDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Adicionar ao Estoque</DialogTitle>
        <DialogContent>
          <DialogContentText>Quantos itens deseja adicionar ao estoque de "{selectedProduct?.name}"?</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="quantity"
            label="Quantidade"
            type="number"
            fullWidth
            variant="outlined"
            value={quantityToAdd}
            onChange={(e) => {
              setQuantityToAdd(e.target.value);
              setIsTouched(true);
            }}
            onBlur={() => {
              if (quantityToAdd.trim() === "") {
                setQuantityToAdd("0");
                setIsTouched(false);
              }
            }}
            InputProps={{ inputProps: { min: 0 } }}
            error={isTouched && (isNaN(parseInt(quantityToAdd, 10)) || parseInt(quantityToAdd, 10) <= 0)}
            helperText={
              isTouched && (isNaN(parseInt(quantityToAdd, 10)) || parseInt(quantityToAdd, 10) <= 0)
                ? "Insira uma quantidade válida maior que zero."
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleAddToStock} color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Excluir Produto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza de que deseja excluir o produto "{selectedProduct?.name}" do estoque?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={() => selectedProduct && handleDeleteProduct(selectedProduct.id)} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <ProductRegisterModal open={isRegisterModalOpen} onClose={handleCloseRegisterModal} product={null} />
    </Box>
  );
};

export default connector(StockPage);
