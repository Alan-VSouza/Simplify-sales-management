/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { Typography,Grid,Card,CardContent,CardMedia,Button,Box,MenuItem,TextField,Divider,Paper,Autocomplete,Alert,} from "@mui/material";
import { styled } from "@mui/system";
import { connect } from "react-redux";
import { ApplicationState } from "@store/index";
import { CartState } from "@reducers/cart/interface";
import { bindActionCreators } from "redux";
import * as CartActions from "@reducers/cart/actions";
import productImage from "../../components/Produto.jpg";
import TransactionRegisterModal from "@pages/Transaction/TransactionRegisterModal";
import { toast } from "react-toastify";

type CartProps = {
  cartState: CartState;
  actions: typeof CartActions.actionsCreators;
};

interface Person {
  id: number;
  name: string;
  type: number;
}

const StyledCard = styled(Card)(({ theme }) => ({
  width: "300px",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
  borderRadius: theme.shape.borderRadius,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.2)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  fontWeight: "bold",
  textTransform: "none",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    color: "#fff",
  },
}));

const Cart: React.FC<CartProps> = ({ cartState, actions }) => {
  const { cartItems } = cartState;

  const [localDiscounts, setLocalDiscounts] = useState<{ [key: number]: string }>({});
  const [discountErrors, setDiscountErrors] = useState<{ [key: number]: string }>({});
  const [localTotalDiscount, setLocalTotalDiscount] = useState<string>('0');
  const [totalDiscountError, setTotalDiscountError] = useState<string>('');

  const [persons, setPersons] = useState<Person[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const [personType, setPersonType] = useState<number | "">("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [canApplyTotalDiscount, setCanApplyTotalDiscount] = useState<boolean>(true);

  const totalValue = cartItems.reduce(
    (acc, item) => acc + item.salesValue * item.quantity,
    0
  );

  const totalDiscount = cartItems.reduce(
    (acc, item) => acc + (item.discount || 0) * item.quantity,
    0
  );

  const finalTotal = totalValue - totalDiscount - (parseFloat(localTotalDiscount) || 0);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const response = await fetch("https://localhost:7159/api/People");
        if (!response.ok) throw new Error("Erro ao buscar pessoas");
        const data: Person[] = await response.json();
        setPersons(data);
        setFilteredPersons(data);
      } catch (error) {
        console.error("Erro ao carregar pessoas:", error);
      }
    };

    fetchPersons();
  }, []);

  useEffect(() => {
    if (personType === "") {
      setFilteredPersons(persons);
    } else {
      setFilteredPersons(persons.filter((person) => person.type === personType));
    }
  }, [personType, persons]);

  useEffect(() => {
    const hasIndividualDiscount = cartItems.some(item => item.discount && item.discount > 0);
    setCanApplyTotalDiscount(!hasIndividualDiscount);

    if (hasIndividualDiscount) {
      setLocalTotalDiscount('0');
      setTotalDiscountError('');
    }
  }, [cartItems]);

  const handleRemoveItem = (id: number) => {
    actions.RemoveFromCart(id);

    setDiscountErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      actions.UpdateQuantity(id, newQuantity);
    } else {
      handleRemoveItem(id);
    }
  };

  const handleDiscountChange = (id: number, discount: number | undefined) => {
    const cartItem = cartItems.find(item => item.id === id);
    if (!cartItem) return;

    const maxDiscount = cartItem.salesValue * cartItem.quantity;

    if (discount === undefined || isNaN(discount)) {
      setDiscountErrors(prev => ({
        ...prev,
        [id]: "Desconto inválido.",
      }));
      actions.UpdateDiscount(id, 0);
      return;
    }

    if (discount < 0) {
      setDiscountErrors(prev => ({
        ...prev,
        [id]: "Desconto não pode ser negativo.",
      }));
      actions.UpdateDiscount(id, 0);
      return;
    }

    if (discount > maxDiscount) {
      setDiscountErrors(prev => ({
        ...prev,
        [id]: `Desconto não pode exceder R$ ${maxDiscount.toFixed(2)}.`,
      }));
      actions.UpdateDiscount(id, maxDiscount);
      return;
    }

    setDiscountErrors(prev => ({
      ...prev,
      [id]: "",
    }));
    actions.UpdateDiscount(id, discount);

    const hasAnyDiscount = cartItems.some(item => (item.id === id ? discount > 0 : item.discount && item.discount > 0));
    if (hasAnyDiscount) {
      setLocalTotalDiscount('0');
      setTotalDiscountError('');
    }
  };

  const handleTotalDiscountChange = (value: string) => {
    const parsedValue = parseFloat(value);
    const remainingValue = totalValue - totalDiscount;

    if (isNaN(parsedValue) || parsedValue < 0) {
      setTotalDiscountError("Desconto total inválido.");
      setLocalTotalDiscount("0");
      return;
    }

    if (parsedValue > remainingValue) {
      setTotalDiscountError(`Desconto total não pode exceder R$ ${remainingValue.toFixed(2)}.`);
      setLocalTotalDiscount(remainingValue.toFixed(2));
      return;
    }

    setTotalDiscountError("");
    setLocalTotalDiscount(parsedValue.toString());
  };

  const handleOpenTransactionModal = () => {
    if (!selectedPerson) {
      toast.error("Por favor, selecione uma pessoa para registrar a transação.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    if (cartItems.length === 0) {
      toast.error("O carrinho está vazio. Adicione itens antes de registrar a transação.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
  
    const parsedTotalDiscount = parseFloat(localTotalDiscount);
    const remainingValue = totalValue - totalDiscount;
  
    if (
      isNaN(parsedTotalDiscount) ||
      parsedTotalDiscount < 0 ||
      parsedTotalDiscount > remainingValue
    ) {
      toast.error("Por favor, insira um valor de desconto total válido.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
  
    setModalOpen(true);
  };
  

  const handleCloseTransactionModal = () => {
    setModalOpen(false);

    setLocalTotalDiscount('0');
    setLocalDiscounts({});
    setDiscountErrors({});
    setTotalDiscountError('');
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: "1200px",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ textAlign: "center", mb: 4 }}
      >
        Carrinho de Compras
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          width: "100%",
          maxWidth: 600,
          display: "flex",
          gap: 2,
          flexDirection: "column",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        }}
      >
        <TextField
          select
          label="Filtrar por Cargo"
          value={personType}
          onChange={(e) =>
            setPersonType(e.target.value === "" ? "" : Number(e.target.value))
          }
          fullWidth
          variant="outlined"
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value={0}>Clientes</MenuItem>
          <MenuItem value={1}>Fornecedores</MenuItem>
        </TextField>

        <Autocomplete
          options={filteredPersons}
          getOptionLabel={(option) => option.name}
          value={filteredPersons.find((p) => p.id === selectedPerson) || null}
          onChange={(event, newValue) => {
            setSelectedPerson(newValue ? newValue.id : null);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Selecione uma Pessoa"
              variant="outlined"
              fullWidth
            />
          )}
          sx={{ width: "100%" }}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </Paper>

      <Grid container spacing={4} justifyContent="center">
        {cartItems.map((item) => (
          <Grid item key={item.id}>
            <StyledCard>
              <CardMedia
                component="img"
                height="150"
                image={productImage}
                alt={`Imagem de ${item.name}`}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Categoria: {item.category}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Marca: {item.brand}
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{ mt: 1, textAlign: "center" }}
                >
                  Preço Unitário: R$ {item.salesValue.toFixed(2)}
                </Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  fontWeight="bold"
                  sx={{ textAlign: "center" }}
                >
                  Desconto: R$ {(item.discount || 0).toFixed(2)}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <StyledButton
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                  >
                    -
                  </StyledButton>
                  <Typography>{item.quantity}</Typography>
                  <StyledButton
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </StyledButton>
                </Box>

                <TextField
                  label="Desconto"
                  type="number"
                  value={
                    localDiscounts[item.id] !== undefined
                      ? localDiscounts[item.id]
                      : item.discount !== undefined
                      ? item.discount
                      : ""
                  }
                  onChange={(e) =>
                    setLocalDiscounts({
                      ...localDiscounts,
                      [item.id]: e.target.value,
                    })
                  }
                  onFocus={() =>
                    setLocalDiscounts({
                      ...localDiscounts,
                      [item.id]: "",
                    })
                  }
                  onBlur={() => {
                    const value = parseFloat(localDiscounts[item.id]);
                    const finalValue = isNaN(value) ? "0" : value.toString();
                    setLocalDiscounts({
                      ...localDiscounts,
                      [item.id]: finalValue,
                    });
                    handleDiscountChange(item.id, isNaN(value) ? 0 : value);
                  }}
                  fullWidth
                  sx={{ mt: 2 }}
                  error={Boolean(discountErrors[item.id])}
                  helperText={discountErrors[item.id] || " "}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      max: (item.salesValue * item.quantity).toFixed(2), 
                      step: 0.01, 
                    },
                  }}
                />

                <StyledButton
                  variant="contained"
                  color="error"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Excluir
                </StyledButton>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: "center", width: "100%", maxWidth: 600 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Total: R$ {finalTotal.toFixed(2)}
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Descontos Individuais e Desconto Total podem ser aplicados simultaneamente, desde que a soma não exceda o valor total do carrinho.
        </Alert>

        <TextField
          label="Desconto Total"
          type="number"
          value={localTotalDiscount}
          onChange={(e) => handleTotalDiscountChange(e.target.value)}
          onBlur={() => {
            const value = parseFloat(localTotalDiscount);
            const finalValue = isNaN(value) ? '0' : value.toString();
            setLocalTotalDiscount(finalValue);
          }}
          fullWidth
          sx={{ mt: 2 }}
          error={Boolean(totalDiscountError)}
          helperText={
            totalDiscountError ||
            "Insira um valor de desconto que não exceda o valor total após os descontos individuais."
          }
          InputProps={{
            inputProps: {
              min: 0,
              max: (totalValue - totalDiscount).toFixed(2), 
              step: 0.01, 
            },
          }}
          disabled={!canApplyTotalDiscount}
        />

        <StyledButton
          variant="contained"
          color="primary"
          onClick={handleOpenTransactionModal}
          sx={{ mt: 2 }}
        >
          Cadastrar Transação
        </StyledButton>
      </Box>

      <TransactionRegisterModal
        open={isModalOpen}
        onClose={handleCloseTransactionModal}
        transactionData={{
          cartItems: cartItems.map((item) => ({
            ...item,
            discount: item.discount || 0,
          })),
          totalValue,
          person: persons.find((p) => p.id === selectedPerson) || null,
          totalDiscount: totalDiscount + (parseFloat(localTotalDiscount) || 0),
        }}
        clearCart={() => actions.ClearCart()}
      />
    </Box>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  cartState: state.cart,
});

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(CartActions.actionsCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
