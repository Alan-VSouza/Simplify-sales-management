import React, { useEffect, useState } from 'react';
import { Typography,Grid,Card,CardContent,Button,Box,TextField,IconButton,CircularProgress,} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SyncIcon from '@mui/icons-material/Sync';
import { styled } from '@mui/system';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as TransactionActions from '@reducers/transaction/actions';
import { ApplicationState } from '@store/index';
import { ITransaction } from '@reducers/transaction/interface';
import TransactionRegisterModal from './TransactionRegisterModal';
import TransactionViewModal from './TransactionViewModal';

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

type PropsFromRedux = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const Transaction: React.FC<PropsFromRedux> = ({ transactions, getAllStatus, actions }) => {
  const [filteredTransactions, setFilteredTransactions] = useState<ITransaction[]>([]);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [isSearchExpanded, setSearchExpanded] = useState(false);
  const [isAnimating, setAnimating] = useState(false);
  const [removingTransactionId, setRemovingTransactionId] = useState<number | null>(null);

  useEffect(() => {
    if (transactions.length === 0) {
      actions.GetAll(true);
    } else {
      applyFilters(transactions, searchQuery, filterActive);
    }
  }, [transactions, actions]);

  const applyFilters = (
    transactions: ITransaction[],
    query: string,
    filter: 'all' | 'active' | 'inactive'
  ) => {
    let result = [...transactions];

    if (query.trim()) {
      result = result.filter((transaction) =>
        transaction.person?.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filter === 'active') {
      result = result.filter((transaction) => transaction.active);
    } else if (filter === 'inactive') {
      result = result.filter((transaction) => !transaction.active);
    }

    setFilteredTransactions(result);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(transactions, query, filterActive);
  };

  const handleFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    setFilterActive(filter);
    applyFilters(transactions, searchQuery, filter);
  };

  const handleToggleTransactionStatus = (id: number, active: boolean) => {
    toast(
      ({ closeToast }) => (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Tem certeza que deseja {active ? 'inativar' : 'ativar'} a transação #{id}?
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="contained"
              color={active ? 'error' : 'success'}
              onClick={() => {
                actions.ToggleStatus(id, active); // Atualiza o status da transação
                closeToast(); // Fecha o toast de confirmação
              }}
              sx={{ textTransform: 'none' }}
            >
              Confirmar
            </Button>
            <Button variant="outlined" onClick={closeToast} sx={{ textTransform: 'none' }}>
              Cancelar
            </Button>
          </Box>
        </Box>
      ),
    );
  };

  const handleViewTransaction = (transaction: ITransaction) => {
    setSelectedTransaction(transaction);
    setViewModalOpen(true);
  };

  const handleCloseModals = () => {
    setRegisterModalOpen(false);
    setViewModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleTransactionAdded = () => {
    actions.GetAll(true);
  };


  const handleRefresh = () => {
    toast.info('Recarregando transações...', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });
    actions.GetAll(true);
  };

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
      <ToastContainer position="top-right" autoClose={3000} />
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
          Transações
        </Typography>
        <AnimatedBox>

          <Box className={`searchBox ${isAnimating ? 'expand' : ''}`}>
            <TextField
              placeholder="Pesquisar por nome..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ width: '100%' }}
            />
          </Box>

          <IconButton onClick={handleToggleSearch} color="primary" aria-label="Pesquisar">
            <SearchIcon />
          </IconButton>

          <Button
            variant={filterActive === 'all' ? 'contained' : 'outlined'}
            onClick={() => handleFilterChange('all')}
          >
            Todos
          </Button>
          <Button
            variant={filterActive === 'active' ? 'contained' : 'outlined'}
            onClick={() => handleFilterChange('active')}
          >
            Ativos
          </Button>
          <Button
            variant={filterActive === 'inactive' ? 'contained' : 'outlined'}
            onClick={() => handleFilterChange('inactive')}
          >
            Inativos
          </Button>

          <IconButton
            onClick={handleRefresh}
            color="secondary"
            aria-label="Recarregar Transações"
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

      {getAllStatus === 'loading' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : filteredTransactions.length > 0 ? (
        <Grid container spacing={3}>
          {filteredTransactions.map((transaction) => (
            <Grid item xs={12} sm={6} md={6} key={transaction.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  backgroundColor: transaction.active ? '' : 'rgba(255, 0, 0, 0.07)',
                }}
              >
                <CardContent
                  sx={{
                    padding: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                    }}
                  >
                    ID: #{transaction.id} ({transaction.active ? 'Ativo' : 'Inativo'})
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: '#2c3e50',
                      marginBottom: 2,
                    }}
                  >
                    {transaction.person?.name || 'Pessoa não identificada'}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="primary"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      marginBottom: 2,
                    }}
                  >
                    Valor Final: R$ {transaction.finalValue ? transaction.finalValue.toFixed(2) : '0.00'}
                  </Typography>
                </CardContent>

                <Box
                  sx={{
                    padding: 2,
                    borderTop: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleViewTransaction(transaction)}
                    sx={{
                      borderRadius: '20px',
                      padding: '6px 16px',
                      fontSize: '0.9rem',
                    }}
                  >
                    Visualizar
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color={transaction.active ? 'error' : 'success'}
                    onClick={() => handleToggleTransactionStatus(transaction.id, transaction.active)}
                    sx={{
                      borderRadius: '20px',
                      padding: '6px 16px',
                      fontSize: '0.9rem',
                    }}
                  >
                    {transaction.active ? 'Inativar' : 'Ativar'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="h6" color="textSecondary" align="center">
          Nenhuma transação encontrada!
        </Typography>
      )}

      <TransactionRegisterModal
        open={isRegisterModalOpen}
        onClose={handleCloseModals}
        transactionData={selectedTransaction || undefined}
        clearCart={() => actions.ClearCart()}
        onTransactionAdded={handleTransactionAdded}
      />

      <TransactionViewModal
        open={isViewModalOpen}
        onClose={handleCloseModals}
        transactionData={selectedTransaction || undefined}
      />
    </Box>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  transactions: state.transaction.transactions,
  getAllStatus: state.transaction.getAllStatus,
});

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(TransactionActions.actionsCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Transaction);
