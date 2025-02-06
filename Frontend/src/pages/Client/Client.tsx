/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { Typography,Grid,Card,CardContent,Button,Box,Avatar,IconButton,TextField,CircularProgress,} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/system';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ApplicationState } from '@store/index';
import * as PeopleActions from '@reducers/people/actions';
import { IPerson } from '@reducers/people/interface';
import PersonRegisterModal from './ClientRegisterModal';

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

const CardContainer = styled(Grid)(({ theme }) => ({
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  opacity: 1,
  transform: 'scale(1)',
  '&.removing': {
    opacity: 0,
    transform: 'scale(0.9)',
  },
}));

type PropsFromRedux = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const Client: React.FC<PropsFromRedux> = ({ people, getAllStatus, actions }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [filteredPeople, setFilteredPeople] = useState<IPerson[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setSearchExpanded] = useState(false);
  const [isAnimating, setAnimating] = useState(false);
  const [removingPersonId, setRemovingPersonId] = useState<number | null>(null);

  useEffect(() => {
    if (people.length === 0) {
      actions.GetAll();
    } else {
      setFilteredPeople(people.filter((person) => person.type === 0));
    }
  }, [people, actions]);

  const handleOpenModal = (person: IPerson | null = null) => {
    setSelectedPerson(person);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPerson(null);
    actions.GetAll(true);
  };

  const handleRefreshPeople = () => {
    actions.GetAll(true);
    toast.info('Atualizando lista de clientes...', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleDeletePerson = (id: number, name: string) => {
    toast(
      ({ closeToast }) => (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Tem certeza que deseja excluir o cliente <strong>"{name}"</strong>?
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setRemovingPersonId(id);
                setTimeout(() => {
                  actions.Delete(id);
                  toast.success('Cliente excluído com sucesso!', { autoClose: 3000 });
                  setRemovingPersonId(null);
                }, 500);
                closeToast();
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
      { autoClose: false }
    );
  };

  const removeAccents = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = people.filter(
      (person) =>
        person.type === 0 &&
        removeAccents(person.name.toLowerCase()).includes(removeAccents(query.toLowerCase()))
    );
    setFilteredPeople(filtered);
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
      <ToastContainer />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap', 
          gap: 20, 
        }}
      >
        <Typography variant="h4" color="#000000" fontWeight="bold">
          Clientes
        </Typography>
        <AnimatedBox>
          <Box className={`searchBox ${isAnimating ? 'expand' : ''}`}>
            <TextField
              placeholder="Pesquisar clientes..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{ width: '100%' }}
            />
          </Box>
          <IconButton onClick={handleToggleSearch} color="primary" aria-label="Pesquisar">
            <SearchIcon />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenModal(null)}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: 30,
            }}
          >
            Cadastrar Cliente
          </Button>
          <IconButton onClick={handleRefreshPeople} color="secondary" aria-label="Atualizar">
            <SyncIcon />
          </IconButton>
        </AnimatedBox>
      </Box>

      {getAllStatus === 'loading' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : filteredPeople.length > 0 ? (
        <Grid container spacing={3}>
          {filteredPeople.map((person) => (
            <CardContainer
              item
              xs={6}
              sm={6}
              md={6}
              key={person.id}
              className={removingPersonId === person.id ? 'removing' : ''}
            >
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
                }}
              >
                <CardContent
                  sx={{
                    padding: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Avatar
                    alt={person.name}
                    src="/default-avatar.jpg"
                    sx={{ width: 80, height: 80 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' }}
                  >
                    {person.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {person.email || 'Email não informado'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Telefone: {person.phoneNumber || 'Não informado'}
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
                    onClick={() => handleOpenModal(person)}
                    sx={{
                      borderRadius: 20,
                      padding: '6px 16px',
                      fontSize: '0.9rem',
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleDeletePerson(person.id!, person.name)}
                    sx={{
                      borderRadius: 20,
                      padding: '6px 16px',
                      fontSize: '0.9rem',
                    }}
                  >
                    Excluir
                  </Button>
                </Box>
              </Card>
            </CardContainer>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="textSecondary" sx={{ mx: 'auto', my: 2 }}>
          Nenhum cliente encontrado.
        </Typography>
      )}

      <PersonRegisterModal
        open={isModalOpen}
        onClose={handleCloseModal}
        person={selectedPerson}
        defaultType={0}
      />
    </Box>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  people: state.people.people,
  getAllStatus: state.people.getAllStatus,
});

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(PeopleActions.actionsCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Client);
