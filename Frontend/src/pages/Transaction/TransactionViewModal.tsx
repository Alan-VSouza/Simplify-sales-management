import React, { useEffect, useState } from 'react';
import { Box,Button,Divider,Typography,Card as MuiCard,TextField,MenuItem,Modal, } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

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
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
}));

const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95vw',
  maxWidth: '450px',
  maxHeight: '90vh',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  outline: 'none',
  overflowY: 'auto',
  padding: theme.spacing(3),
  animation: `${fadeIn} 0.3s ease-out`,
}));

interface TransactionVisualizarModalProps {
  open: boolean;
  onClose: () => void;
  transactionData?: {
    id?: number;
    cartItems: {
      id: number;
      name: string;
      salesValue: number;
      quantity: number;
    }[];
    totalValue: number;
    totalDiscount: number;
    finalValue: number;
    transactionAt: string;
    person?: { id: number; name: string };
    paymentMethod: number;
    type: number;
    active: boolean;
  };
}

const TransactionVisualizarModal: React.FC<TransactionVisualizarModalProps> = ({
  open,
  onClose,
  transactionData,
}) => {
  const transactionTypes = ['Compra', 'Venda'];
  const paymentMethods = ['Cartão de Crédito', 'Pix', 'Dinheiro', 'Transferência'];

  const [formData, setFormData] = useState({
    transactionAt: '',
    personId: '',
    type: '',
    totalValue: 0,
    totalDiscount: 0,
    finalValue: 0,
    paymentMethod: '',
    active: true,
  });

  useEffect(() => {
    if (transactionData) {
      setFormData({
        transactionAt: transactionData.transactionAt || '',
        personId: String(transactionData.person?.id || ''),
        type: transactionData.type.toString(), 
        totalValue: transactionData.totalValue || 0,
        totalDiscount: transactionData.totalDiscount || 0,
        finalValue: transactionData.finalValue || 0,
        paymentMethod: transactionData.paymentMethod.toString(),
        active: transactionData.active,
      });
    }
  }, [transactionData]);

  return (
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
            sx={{ textAlign: 'center', marginBottom: 2 }}
          >
            Visualizar Transação
          </Typography>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
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
              fullWidth
              disabled
            />

            <TextField
              id="personId"
              name="personId"
              type="number"
              label="ID da Pessoa"
              value={formData.personId}
              fullWidth
              disabled
            />

            <TextField
              id="type"
              name="type"
              select
              label="Tipo"
              value={formData.type}
              fullWidth
              disabled
            >
              {transactionTypes.map((type, index) => (
                <MenuItem key={index} value={index.toString()}>
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
              fullWidth
              disabled
            />

            <TextField
              id="totalDiscount"
              name="totalDiscount"
              type="number"
              label="Desconto Total"
              value={formData.totalDiscount}
              fullWidth
              disabled
            />

            <TextField
              id="finalValue"
              name="finalValue"
              type="number"
              label="Valor Final"
              value={formData.finalValue}
              fullWidth
              disabled
            />

            <TextField
              id="paymentMethod"
              name="paymentMethod"
              select
              label="Método de Pagamento"
              value={formData.paymentMethod}
              fullWidth
              disabled
            >
              {paymentMethods.map((method, index) => (
                <MenuItem key={index} value={index.toString()}>
                  {method}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={onClose} variant="outlined" color="secondary">
                Fechar
              </Button>
            </Box>
          </Box>
        </Card>
      </ModalContainer>
    </Modal>
  );
};

export default TransactionVisualizarModal;
