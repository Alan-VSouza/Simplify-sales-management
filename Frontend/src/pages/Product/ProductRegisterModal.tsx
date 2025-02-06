/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';
import { Modal,Box,TextField,Button,Typography,Divider,FormLabel,FormControl,FormHelperText, } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import MuiCard from '@mui/material/Card';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { actionsCreators } from "@reducers/products";
import { ApplicationState, IProduct } from "@store/index";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -55%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
`;

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  padding: theme.spacing(3),
  gap: theme.spacing(1.5),
  boxSizing: 'border-box',
  boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1), 0px 15px 35px -5px rgba(0, 0, 0, 0.05)',
  maxWidth: '100%',
}));

const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '500px',
  maxHeight: '85vh',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[24],
  borderRadius: theme.spacing(1),
  outline: 'none',
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: theme.spacing(2),
  boxSizing: 'border-box',
  animation: `${fadeIn} 0.3s ease-out`,
}));

interface ProductRegisterModalProps {
  open: boolean;
  onClose: () => void;
  product?: IProduct | null;
}

const ProductRegisterModal: React.FC<ProductRegisterModalProps> = ({ open, onClose, product }) => {
  const dispatch = useDispatch();

  const productsState = useSelector((state: ApplicationState) => state.products);

  const [form, setForm] = useState<IProduct>({
    id: 0, 
    name: '',
    category: '',
    type: '',
    brand: '',
    quantity: 0,
    factoryValue: 0,
    salesValue: 0,
    active: true,
    createAt: new Date(), 
    updateAt: new Date(),
  });

  const [brands, setBrands] = useState<string[]>(['Principal', 'Secundaria']);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrand, setNewBrand] = useState('');

  const [priceError, setPriceError] = useState(false);

  const categories = ['Produto', 'Serviço'];

  useEffect(() => {
    if (open && !product) {

      setForm({
        id: 0,
        name: '',
        category: '',
        type: '',
        brand: '',
        quantity: 0,
        factoryValue: 0,
        salesValue: 0,
        active: true,
        createAt: new Date(),
        updateAt: new Date(),
      });
    } else if (product) {

      setForm({
        ...product,
        createAt: product.createAt || new Date(),
        updateAt: product.updateAt || new Date(),
      });
    }
  }, [product, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'quantity' || name === 'factoryValue' || name === 'salesValue'
        ? Number(value)
        : value,
    });
  };

  const handleCategoryChange = (_: React.SyntheticEvent, value: string | null) => {
    setForm({ 
      ...form, 
      category: value || '', 
      type: value || '' 
    });
  };

  const isService = form.category === 'Serviço';

  const brandLabel = isService ? 'Empresa' : 'Marca';
  const brandPlaceholder = isService ? 'Escolha ou digite uma empresa' : 'Escolha ou digite uma marca';
  const addNewOption = isService ? 'Digitar um novo nome de empresa' : 'Digitar uma nova marca';
  const newBrandPlaceholder = isService ? 'Nova empresa' : 'Nova marca';
  const salesLabel = isService ? 'Preço do Serviço' : 'Preço de Venda';
  const quantityLabel = isService ? 'Quantidade de usos' : 'Estoque Inicial';
  const quantityPlaceholder = isService ? 'Digite a quantidade de usos' : 'Digite o estoque inicial';

  const handleBrandSelection = (_: React.SyntheticEvent, value: string | null) => {
    if (value === addNewOption) { 
      setIsAddingBrand(true);
      setForm({ ...form, brand: '' });
    } else {
      setIsAddingBrand(false);
      setForm({ ...form, brand: value || '' });
    }
  };

  const handleAddNewBrand = () => {
    if (newBrand.trim()) {
      setBrands((prevBrands) => [...prevBrands, newBrand]);
      setForm({ ...form, brand: newBrand });
      setNewBrand('');
      setIsAddingBrand(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.salesValue <= 0) { 
      setPriceError(true);
      return;
    }

    const { createAt, updateAt, ...payloadWithoutDates } = {
      ...form,
      factoryValue: isService ? 0 : form.factoryValue,

    };

    try {
      if (product) {

        await dispatch(actionsCreators.Edit(payloadWithoutDates));
        toast.success(`Produto ${isService ? 'serviço' : 'editado'} com sucesso!`, { position: 'top-right', autoClose: 3000 });
      } else {

        await dispatch(actionsCreators.Add(payloadWithoutDates));
        toast.success(`Produto cadastrado com sucesso!`, { position: 'top-right', autoClose: 3000 });
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto. Tente novamente.', { position: 'top-right', autoClose: 3000 });
    }
  };

  return (
    <>

      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-title"
        closeAfterTransition
        BackdropProps={{
          style: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <ModalContainer>
          <Card>
            <Typography
              component="h1"
              variant="h5"
              id="modal-title"
              sx={{
                width: '100%',
                fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
                textAlign: 'center',
                marginBottom: 2,
              }}
            >
              {product ? 'Editar Produto' : 'Cadastrar Produto'}
            </Typography>
            <Divider />
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                marginTop: 2,
              }}
            >

              <FormControl fullWidth>
                <FormLabel htmlFor="name">Nome</FormLabel>
                <TextField
                  id="name"
                  name="name"
                  placeholder="Digite o nome do produto"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </FormControl>

              <FormControl fullWidth>
                <FormLabel>Categoria</FormLabel>
                <Autocomplete
                  options={categories}
                  value={form.category}
                  onChange={handleCategoryChange}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Escolha uma categoria" required />
                  )}
                />
              </FormControl>

              <FormControl fullWidth>
                <FormLabel>{brandLabel}</FormLabel>
                <Autocomplete
                  options={[...brands, addNewOption]}
                  value={form.brand}
                  onChange={handleBrandSelection}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={brandPlaceholder}
                      required
                    />
                  )}
                />
                {isAddingBrand && (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                    <TextField
                      placeholder={newBrandPlaceholder}
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddNewBrand}
                      disabled={!newBrand.trim()}
                    >
                      Adicionar
                    </Button>
                  </Box>
                )}
              </FormControl>

              {!isService && (
                <FormControl fullWidth>
                  <FormLabel>Preço de Fábrica</FormLabel>
                  <TextField
                    name="factoryValue"
                    type="number"
                    placeholder="Digite o valor de fábrica"
                    value={form.factoryValue}
                    onChange={handleChange}
                    required={!isService} 
                  />
                </FormControl>
              )}

              <FormControl fullWidth>
                <FormLabel>{salesLabel}</FormLabel>
                <TextField
                  name="salesValue"
                  type="number"
                  placeholder={isService ? 'Digite o preço do serviço' : 'Digite o preço de venda'}
                  value={form.salesValue}
                  onChange={(e) => {
                    setPriceError(false);
                    handleChange(e);
                  }}
                  required
                />
                {priceError && (
                  <FormHelperText error>
                    O preço {isService ? 'do serviço' : 'de venda'} deve ser maior que zero.
                  </FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth>
                <FormLabel>{quantityLabel}</FormLabel>
                <TextField
                  name="quantity"
                  type="number"
                  placeholder={quantityPlaceholder}
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </FormControl>

              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button onClick={onClose} variant="outlined" color="secondary">
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Salvar
                </Button>
              </Box>
            </Box>
          </Card>
        </ModalContainer>
      </Modal>
    </>
  );
};

export default ProductRegisterModal;
