/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { Typography, Grid, Button, Box, CircularProgress } from "@mui/material";
import PersonCard from "../../components/PersonCard";
import PageToolbar from "../../components/PageToolbar";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { styled } from '@mui/system';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ApplicationState } from '@store/index';
import * as PeopleActions from '@reducers/people/actions';
import { IPerson } from '@reducers/people/interface';
import SupplierRegisterModal from './SupplierRegisterModal';


const CardContainer = styled(Grid)(() => ({
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  opacity: 1,
  transform: 'scale(1)',
  '&.removing': {
    opacity: 0,
    transform: 'scale(0.9)',
  },
}));

type PropsFromRedux = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const Supplier: React.FC<PropsFromRedux> = ({ people, getAllStatus, actions }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [filteredPeople, setFilteredPeople] = useState<IPerson[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [removingPersonId, setRemovingPersonId] = useState<number | null>(null);

  useEffect(() => {
    if (people.length === 0) {
      actions.GetAll();
    } else {
      setFilteredPeople(people.filter((person) => person.type === 1));
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

  const handleRefreshSuppliers = () => {
    actions.GetAll(true);
    toast.info('Atualizando lista de fornecedores...', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleDeletePerson = (id: number, name: string) => {
    toast(
      ({ closeToast }) => (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Tem certeza que deseja excluir o fornecedor <strong>"{name}"</strong>?
          </Typography>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setRemovingPersonId(id);
                setTimeout(() => {
                  actions.Delete(id);
                  toast.success('Fornecedor excluído com sucesso!', { autoClose: 3000 });
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
        person.type === 1 &&
        removeAccents(person.name.toLowerCase()).includes(removeAccents(query.toLowerCase()))
    );
    setFilteredPeople(filtered);
  };

  return (
    <Box>
      <ToastContainer />
      <PageToolbar
        search={searchQuery}
        onSearch={handleSearch}
        placeholder="Pesquisar fornecedores..."
        onRefresh={handleRefreshSuppliers}
      >
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => handleOpenModal(null)}>
          Novo fornecedor
        </Button>
      </PageToolbar>

      {getAllStatus === 'loading' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : filteredPeople.length > 0 ? (
        <Grid container spacing={2.5}>
          {filteredPeople.map((person) => (
            <CardContainer
              item
              xs={12}
              sm={6}
              lg={4}
              key={person.id}
              className={removingPersonId === person.id ? 'removing' : ''}
            >
              <PersonCard
                name={person.name}
                email={person.email}
                phone={person.phoneNumber}
                document={person.document}
                onEdit={() => handleOpenModal(person)}
                onDelete={() => handleDeletePerson(person.id!, person.name)}
              />
            </CardContainer>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" color="textSecondary" sx={{ mx: 'auto', my: 2 }}>
          Nenhum fornecedor encontrado.
        </Typography>
      )}

      <SupplierRegisterModal
        open={isModalOpen}
        onClose={handleCloseModal}
        person={selectedPerson}
        defaultType={1}
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

export default connect(mapStateToProps, mapDispatchToProps)(Supplier);
