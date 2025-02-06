/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import { Box,Button,Divider,Typography,Card as MuiCard,TextField,MenuItem,Modal, } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connect, ConnectedProps } from "react-redux";
import { ApplicationState } from "@store/index";
import { bindActionCreators } from "redux";
import * as TransactionActions from "@reducers/transaction/actions";

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
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
}));

const ModalContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "95vw",
  maxWidth: "450px",
  maxHeight: "90vh",
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  outline: "none",
  overflowY: "auto",
  padding: theme.spacing(3),
  animation: `${fadeIn} 0.3s ease-out`,
}));

const connector = connect(
  (state: ApplicationState) => ({
    transactionState: state.transaction,
  }),
  (dispatch) => ({
    actions: bindActionCreators(TransactionActions.actionsCreators, dispatch),
  })
);


type PropsFromRedux = ConnectedProps<typeof connector>;

interface TransactionRegisterModalProps extends PropsFromRedux {
  open: boolean;
  onClose: () => void;
  transactionData?: {
    cartItems: {
      id: number;
      name: string;
      salesValue: number;
      amount: number;
      discount?: number;
    }[];
    totalValue: number;
    totalDiscount: number;
    person?: { id: number; name: string };
  };
  clearCart: () => void;
}

const getLocalDateTime = () => {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString().slice(0, 16);
};

const TransactionRegisterModal: React.FC<TransactionRegisterModalProps> = ({
  open,
  onClose,
  transactionData,
  clearCart,
  actions,
}) => {
  const initialData = {
    transactionAt: getLocalDateTime(),
    personId: transactionData?.person?.id || "",
    type: "",
    totalValue: transactionData?.totalValue || 0,
    totalDiscount: transactionData?.totalDiscount || 0,
    finalValue:
      (transactionData?.totalValue || 0) - (transactionData?.totalDiscount || 0),
    paymentMethod: "",
    active: true,
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (open) {
      setFormData({
        transactionAt: getLocalDateTime(),
        personId: transactionData?.person?.id || "",
        type: "",
        totalValue: transactionData?.totalValue || 0,
        totalDiscount: transactionData?.totalDiscount || 0,
        finalValue:
          (transactionData?.totalValue || 0) -
          (transactionData?.totalDiscount || 0),
        paymentMethod: "",
        active: true,
      });
    }
  }, [open, transactionData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedValue =
        name === "totalDiscount" || name === "finalValue"
          ? Number(value)
          : value;

      if (name === "totalDiscount") {
        const newFinalValue = prev.totalValue - Number(value);
        return {
          ...prev,
          [name]: updatedValue,
          finalValue: newFinalValue < 0 ? 0 : newFinalValue,
        };
      }

      return { ...prev, [name]: updatedValue };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (
      !formData.transactionAt ||
      !formData.personId ||
      formData.type === "" ||
      formData.totalValue <= 0 ||
      formData.finalValue <= 0 ||
      formData.paymentMethod === ""
    ) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
  
    const transactionPayload = {
      transactionAt: formData.transactionAt,
      personId: Number(formData.personId),
      type: Number(formData.type),
      totalValue: Number(formData.totalValue),
      totalDiscount: Number(formData.totalDiscount),
      finalValue: Number(formData.finalValue),
      paymentMethod: Number(formData.paymentMethod),
      transactionsItems:
        transactionData?.cartItems.map((item) => ({
          productId: item.id,
          amount: item.quantity, 
          value: item.salesValue,
          sellValue: item.salesValue * item.quantity,
          discount: (item.discount || 0) * item.quantity,
        })) || [],
      active: formData.active,
    };
    
  
    try {
      if (actions.Add) {
        await actions.Add(transactionPayload);
        toast.success("Transação registrada com sucesso!");
      } else {
        console.error("Ação 'Add' não está definida.");
        toast.error("Erro: Ação 'Add' não está disponível.");
      }
      if (typeof clearCart === "function") clearCart();
      onClose();
    } catch (error) {
      console.error("Erro ao registrar transação:", error);
      toast.error("Erro ao registrar a transação.");
    }
  };
  

  return (
    <>
      <ToastContainer />
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-title"
        closeAfterTransition
        BackdropProps={{
          style: {
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <ModalContainer>
          <Card>
            <Typography
              component="h1"
              variant="h5"
              id="modal-title"
              sx={{ textAlign: "center", marginBottom: 2 }}
            >
              Cadastrar Transação
            </Typography>
            <Divider />
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                marginTop: 2,
              }}
            >
              <TextField
                id="transactionAt"
                name="transactionAt"
                type="datetime-local"
                label="Data e Hora da Transação"
                value={formData.transactionAt}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                id="personId"
                name="personId"
                type="number"
                label="ID da Pessoa"
                value={formData.personId}
                required
                fullWidth
                disabled
              />
              <TextField
                id="type"
                name="type"
                select
                label="Tipo"
                value={formData.type}
                onChange={handleChange}
                required
                fullWidth
              >
                {["Compra", "Venda"].map((type, index) => (
                  <MenuItem key={index} value={index}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                id="totalValue"
                name="totalValue"
                type="number"
                label="Valor Total"
                value={formData.totalValue}
                required
                fullWidth
                disabled
              />
              <TextField
                id="totalDiscount"
                name="totalDiscount"
                type="number"
                label="Desconto Total"
                value={formData.totalDiscount}
                required
                fullWidth
                disabled
              />
              <TextField
                id="finalValue"
                name="finalValue"
                type="number"
                label="Valor Final"
                value={formData.finalValue}
                required
                fullWidth
                disabled
              />
              <TextField
                id="paymentMethod"
                name="paymentMethod"
                select
                label="Método de Pagamento"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                fullWidth
              >
                {["Cartão de Crédito", "Pix", "Dinheiro", "Transferência"].map(
                  (method, index) => (
                    <MenuItem key={index} value={index}>
                      {method}
                    </MenuItem>
                  )
                )}
              </TextField>
              <Box
                sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
              >
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

export default connector(TransactionRegisterModal);
