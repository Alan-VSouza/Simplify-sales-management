import React from 'react';
import {
  Box,
  Button,
  Card as MuiCard,
  Chip,
  Divider,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { ITransaction, PaymentMethod, TransactionType } from '@reducers/transaction/interface';
import { formatCurrency, formatDateTime } from '../../utils/format';

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
  padding: theme.spacing(3),
  gap: theme.spacing(2),
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
}));

const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '95vw',
  maxWidth: '560px',
  maxHeight: '90vh',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  outline: 'none',
  overflowY: 'auto',
  animation: `${fadeIn} 0.3s ease-out`,
}));

// Labels must follow the backend enums (Models/Transaction.cs).
const transactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.Buy]: 'Compra',
  [TransactionType.Sell]: 'Venda',
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CreditCard]: 'Cartão de crédito',
  [PaymentMethod.DebitCard]: 'Cartão de débito',
  [PaymentMethod.Money]: 'Dinheiro',
  [PaymentMethod.Pix]: 'Pix',
};

interface TransactionViewModalProps {
  open: boolean;
  onClose: () => void;
  transaction: ITransaction | null;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between" gap={2}>
    <Typography color="text.secondary">{label}</Typography>
    <Typography fontWeight={500} textAlign="right">
      {value}
    </Typography>
  </Box>
);

const TransactionViewModal: React.FC<TransactionViewModalProps> = ({ open, onClose, transaction }) => {
  const items = transaction?.transactionsItems ?? [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="transaction-view-title"
      closeAfterTransition
      slotProps={{ backdrop: { style: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' } } }}
    >
      <ModalContainer>
        <Card>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
            <Typography component="h1" variant="h5" id="transaction-view-title">
              Transação #{transaction?.id}
            </Typography>
            {transaction && (
              <Chip
                label={transaction.active ? 'Ativa' : 'Inativa'}
                color={transaction.active ? 'success' : 'default'}
                size="small"
              />
            )}
          </Box>
          <Divider />

          {transaction ? (
            <>
              <Box display="flex" flexDirection="column" gap={1}>
                <InfoRow label="Data" value={formatDateTime(transaction.transactionAt)} />
                <InfoRow label="Tipo" value={transactionTypeLabels[transaction.type] ?? '-'} />
                <InfoRow label={transaction.type === TransactionType.Buy ? 'Fornecedor' : 'Cliente'} value={transaction.person?.name ?? '-'} />
                <InfoRow label="Pagamento" value={paymentMethodLabels[transaction.paymentMethod] ?? '-'} />
              </Box>

              {items.length > 0 && (
                <Table size="small" aria-label="Itens da transação">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Qtd.</TableCell>
                      <TableCell align="right">Unitário</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product?.name ?? `Produto #${item.productId}`}</TableCell>
                        <TableCell align="right">{item.amount}</TableCell>
                        <TableCell align="right">{formatCurrency(item.sellValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              <Divider />
              <Box display="flex" flexDirection="column" gap={1}>
                <InfoRow label="Subtotal" value={formatCurrency(transaction.totalValue)} />
                <InfoRow label="Descontos" value={formatCurrency(transaction.totalDiscount)} />
                <InfoRow
                  label="Total"
                  value={<Typography component="span" variant="h6">{formatCurrency(transaction.finalValue)}</Typography>}
                />
              </Box>
            </>
          ) : (
            <Typography color="text.secondary">Nenhuma transação selecionada.</Typography>
          )}

          <Box display="flex" justifyContent="flex-end">
            <Button onClick={onClose} variant="outlined">
              Fechar
            </Button>
          </Box>
        </Card>
      </ModalContainer>
    </Modal>
  );
};

export default TransactionViewModal;
