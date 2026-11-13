import React, { useEffect, useState } from "react";
import { Typography, Card, Button, Box, CircularProgress } from "@mui/material";
import {
  Avatar,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { brand, chartPalette } from "../../theme";
import { formatCurrency, formatDateTime } from "../../utils/format";
import { PaymentMethod, TransactionType } from "@reducers/transaction/interface";

const paymentLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CreditCard]: "Crédito",
  [PaymentMethod.DebitCard]: "Débito",
  [PaymentMethod.Money]: "Dinheiro",
  [PaymentMethod.Pix]: "Pix",
};
import PageToolbar from "../../components/PageToolbar";
import { ButtonGroup } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import * as TransactionActions from "@reducers/transaction/actions";
import { ApplicationState } from "@store/index";
import { ITransaction } from "@reducers/transaction/interface";
import TransactionViewModal from "./TransactionViewModal";

type PropsFromRedux = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const Transaction: React.FC<PropsFromRedux> = ({ transactions, getAllStatus, actions }) => {
  const [filteredTransactions, setFilteredTransactions] = useState<ITransaction[]>([]);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    if (transactions.length === 0) {
      actions.GetAll(true);
    } else {
      applyFilters(transactions, searchQuery, filterActive);
    }
  }, [transactions, actions]);

  const applyFilters = (transactions: ITransaction[], query: string, filter: "all" | "active" | "inactive") => {
    let result = [...transactions];

    if (query.trim()) {
      result = result.filter((transaction) => transaction.person?.name.toLowerCase().includes(query.toLowerCase()));
    }

    if (filter === "active") {
      result = result.filter((transaction) => transaction.active);
    } else if (filter === "inactive") {
      result = result.filter((transaction) => !transaction.active);
    }

    setFilteredTransactions(result);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(transactions, query, filterActive);
  };

  const handleFilterChange = (filter: "all" | "active" | "inactive") => {
    setFilterActive(filter);
    applyFilters(transactions, searchQuery, filter);
  };

  const handleToggleTransactionStatus = (id: number, active: boolean) => {
    toast(({ closeToast }) => (
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Tem certeza que deseja {active ? "inativar" : "ativar"} a transação #{id}?
        </Typography>
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button
            variant="contained"
            color={active ? "error" : "success"}
            onClick={() => {
              actions.ToggleStatus(id); // Atualiza o status da transação
              closeToast(); // Fecha o toast de confirmação
            }}
            sx={{ textTransform: "none" }}
          >
            Confirmar
          </Button>
          <Button variant="outlined" onClick={closeToast} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
        </Box>
      </Box>
    ));
  };

  const handleViewTransaction = (transaction: ITransaction) => {
    setSelectedTransaction(transaction);
    setViewModalOpen(true);
  };

  const handleCloseModals = () => {
    setViewModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleRefresh = () => {
    toast.info("Recarregando transações...", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
    actions.GetAll(true);
  };

  return (
    <Box>
      <ToastContainer position="top-right" autoClose={3000} />
      <PageToolbar
        search={searchQuery}
        onSearch={handleSearch}
        placeholder="Pesquisar por nome..."
        onRefresh={handleRefresh}
        filters={
          <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: "#fff", borderRadius: "10px" }}>
            {(["all", "active", "inactive"] as const).map((key) => (
              <Button
                key={key}
                variant={filterActive === key ? "contained" : "outlined"}
                onClick={() => handleFilterChange(key)}
              >
                {{ all: "Todas", active: "Ativas", inactive: "Inativas" }[key]}
              </Button>
            ))}
          </ButtonGroup>
        }
      />

      {getAllStatus === "loading" ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      ) : filteredTransactions.length > 0 ? (
        <Card sx={{ overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pessoa</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Pagamento</TableCell>
                  <TableCell align="right">Valor final</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const isSale = transaction.type === TransactionType.Sell;
                  const tone = isSale ? brand.green : chartPalette[4];
                  return (
                    <TableRow key={transaction.id} hover sx={{ opacity: transaction.active ? 1 : 0.55 }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 36,
                              height: 36,
                              fontSize: 14,
                              fontWeight: 800,
                              bgcolor: alpha(tone, 0.12),
                              color: tone,
                            }}
                          >
                            {(transaction.person?.name ?? "?").charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                              {transaction.person?.name || "Pessoa não identificada"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              #{transaction.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                        {formatDateTime(transaction.transactionAt)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={isSale ? "Venda" : "Compra"}
                          sx={{ bgcolor: alpha(tone, 0.1), color: tone }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {paymentLabels[transaction.paymentMethod] ?? "-"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, whiteSpace: "nowrap" }}>
                        {formatCurrency(transaction.finalValue)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={transaction.active ? "Ativa" : "Inativa"}
                          color={transaction.active ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            size="small"
                            onClick={() => handleViewTransaction(transaction)}
                            aria-label="Ver detalhes"
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={transaction.active ? "Inativar" : "Reativar"}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleTransactionStatus(transaction.id, transaction.active)}
                            aria-label={transaction.active ? "Inativar" : "Reativar"}
                            sx={{ "&:hover": { color: transaction.active ? "error.main" : "success.main" } }}
                          >
                            {transaction.active ? (
                              <BlockRoundedIcon fontSize="small" />
                            ) : (
                              <RestartAltRoundedIcon fontSize="small" />
                            )}
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
      ) : (
        <Typography variant="h6" color="textSecondary" align="center">
          Nenhuma transação encontrada!
        </Typography>
      )}

      <TransactionViewModal open={isViewModalOpen} onClose={handleCloseModals} transaction={selectedTransaction} />
    </Box>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  transactions: state.transaction.transactions,
  getAllStatus: state.transaction.getAllStatus,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: bindActionCreators(TransactionActions.actionsCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Transaction);
