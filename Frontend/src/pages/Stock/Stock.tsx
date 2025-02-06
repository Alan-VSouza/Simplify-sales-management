/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */

import React, { useEffect, useState } from 'react';
import { Typography,Box,Button,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,TextField,IconButton,TableSortLabel,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle, } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync'; 
import { styled } from '@mui/system';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductRegisterModal from '@pages/Product/ProductRegisterModal';
import productImage from '../../components/Produto.jpg';
import { connect, ConnectedProps } from 'react-redux';
import { ApplicationState } from '@store/index';
import { bindActionCreators } from 'redux';
import * as StockActions from '@reducers/stock/actions';

const AnimatedBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '.searchBox': {
    overflow: 'hidden',
    maxWidth: 0,
    opacity: 0,
    transition: 'max-width 0.4s ease, opacity 0.4s ease',
  },
  '.searchBox.expand': {
    maxWidth: 200,
    opacity: 1,
  },
}));

const connector = connect(
  (state: ApplicationState) => ({
    stockState: state.stock,
  }),
  (dispatch) => ({
    actions: bindActionCreators(StockActions.actionsCreators, dispatch),
  })
);

type PropsFromRedux = ConnectedProps<typeof connector>;

const StockPage: React.FC<PropsFromRedux> = ({ stockState, actions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setSearchExpanded] = useState(false);
  const [isAnimating, setAnimating] = useState(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof typeof stockState.stockItems[0]>('name');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState(''); 
  const [isTouched, setIsTouched] = useState(false); 
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  useEffect(() => {
    actions.GetAllStock();
  }, [actions]);

  const handleRequestSort = (property: keyof typeof stockState.stockItems[0]) => {
    const isAscending = orderBy === property && order === 'asc';
    setOrder(isAscending ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const handleOpenAddDialog = (product: any) => {
    setSelectedProduct(product);
    setAddDialogOpen(true);
    setQuantityToAdd(''); 
    setIsTouched(false); 
  };

  const handleAddToStock = async () => {
    if (!selectedProduct) {
      toast.error('Produto não selecionado.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    const quantityNumber = parseInt(quantityToAdd, 10);

    if (isNaN(quantityNumber) || quantityNumber <= 0) {
      toast.error('Insira uma quantidade válida maior que zero.', { position: 'top-right', autoClose: 3000 });
      return;
    }

    try {
      const updatedQuantity = selectedProduct.quantity + quantityNumber;
      await actions.UpdateStock(selectedProduct.id, { ...selectedProduct, quantity: updatedQuantity });

      toast.success(`Estoque de ${selectedProduct.name} atualizado com sucesso!`, {
        position: 'top-right',
        autoClose: 3000,
      });

      setAddDialogOpen(false);
      setQuantityToAdd(''); 
      setIsTouched(false); 
      actions.GetAllStock(); 
    } catch (error) {
      toast.error('Erro ao atualizar o estoque.', { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await actions.DeleteProduct(productId);
      toast.success('Produto excluído com sucesso.', { position: 'top-right', autoClose: 3000 });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao excluir o produto.', { position: 'top-right', autoClose: 3000 });
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
    actions.GetAllStock(true); 
    toast.info('Estoque atualizado!', { position: 'top-right', autoClose: 2000 });
  };

  const filteredProducts = stockState.stockItems
    .filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (orderBy === 'quantity' || orderBy === 'salesValue') {
        return order === 'asc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
      }
      return order === 'asc'
        ? a[orderBy].localeCompare(b[orderBy])
        : b[orderBy].localeCompare(a[orderBy]);
    });

  const handleToggleSearch = () => {
    if (!isSearchExpanded) {
      setAnimating(true);
      setSearchExpanded(true);
    } else {
      setAnimating(false);
      setTimeout(() => setSearchExpanded(false), 400);
    }
  };

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
        <Typography variant="h4" color="#000000" fontWeight="bold" gutterBottom>
          Estoque
        </Typography>
        <AnimatedBox>
          <Box className={`searchBox ${isAnimating ? 'expand' : ''}`}>
            <TextField
              placeholder="Pesquisar produtos..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: '100%' }}
            />
          </Box>
          <IconButton onClick={handleToggleSearch} color="primary" aria-label="Pesquisar">
            <SearchIcon />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRegisterTransaction}
            sx={{
              borderRadius: 30,
              fontWeight: 'bold',
              textTransform: 'none',
              padding: '8px 20px',
            }}
          >
            Cadastrar Produto
          </Button>

          <IconButton
            onClick={handleRefreshStock}
            color="secondary"
            aria-label="Atualizar Estoque"
            sx={{
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'rotate(360deg)',
              },
            }}
          >
            <SyncIcon />
          </IconButton>
        </AnimatedBox>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: 3,
          marginTop: 4,
          marginBottom: 4,
          marginLeft: 'auto', 
          marginRight: 'auto',
          overflowX: 'auto',
          background: '#fff',
          padding: 0,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Imagem</TableCell>
              {['name', 'brand', 'type', 'category', 'salesValue', 'quantity'].map((column) => (
                <TableCell
                  key={column}
                  align="center"
                  sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >
                  <TableSortLabel
                    active={orderBy === column}
                    direction={orderBy === column ? order : 'asc'}
                    onClick={() => handleRequestSort(column as keyof typeof stockState.stockItems[0])}
                  >
                    {column === 'name'
                      ? 'Nome'
                      : column === 'brand'
                      ? 'Marca'
                      : column === 'type'
                      ? 'Tipo'
                      : column === 'category'
                      ? 'Categoria'
                      : column === 'salesValue'
                      ? 'Valor'
                      : 'Qtd/Estoque'}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell align="center">
                  <img
                    src={productImage}
                    alt={product.name}
                    style={{ width: 50, height: 40, borderRadius: 4, objectFit: 'cover' }}
                  />
                </TableCell>
                <TableCell align="center">{product.name}</TableCell>
                <TableCell align="center">{product.brand}</TableCell>
                <TableCell align="center">{product.type}</TableCell>
                <TableCell align="center">{product.category}</TableCell>
                <TableCell align="center">
                  <Typography color="primary" fontWeight="bold">
                    R$ {product.salesValue.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="bold">{product.quantity}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenAddDialog(product)}
                    sx={{
                      minWidth: 90,
                      marginRight: 1,
                      fontSize: '0.8rem',
                      padding: '4px 8px',
                    }}
                  >
                    Adicionar
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => {
                      setSelectedProduct(product);
                      setDeleteDialogOpen(true);
                    }}
                    sx={{
                      minWidth: 90,
                      fontSize: '0.8rem',
                      padding: '4px 8px',
                    }}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={isAddDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Adicionar ao Estoque</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Quantos itens deseja adicionar ao estoque de "{selectedProduct?.name}"?
          </DialogContentText>
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
              if (quantityToAdd.trim() === '') {
                setQuantityToAdd('0');
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
          <Button
            onClick={() => selectedProduct && handleDeleteProduct(selectedProduct.id)}
            color="error"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <ProductRegisterModal
        open={isRegisterModalOpen}
        onClose={handleCloseRegisterModal}
        product={null}
        onSave={() => handleCloseRegisterModal()}
      />
    </Box>
  );
};

export default connector(StockPage);
