/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { Modal, Box, TextField, Button, Typography, Divider, FormLabel, FormControl } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import InputMask from 'react-input-mask';
import FormHelperText from '@mui/material/FormHelperText';
import MuiCard from '@mui/material/Card';
import { toast } from 'react-toastify';
import { validateCPF, validateCNPJ, validatePhone, validateEmail } from '@pages/utils/validators';
import { connect } from 'react-redux';
import { ApplicationState } from '@store/index';
import { IPerson } from '@reducers/people/interface';
import * as PeopleActions from '@reducers/people/actions';
import { bindActionCreators } from 'redux';

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
  width: '95vw',
  maxWidth: '450px',
  maxHeight: '90vh',
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

interface Person {
  id?: number;
  name: string;
  email: string;
  phoneNumber: string;
  document: string;
  type: number;
}

interface PersonRegisterModalProps {
  open: boolean;
  onClose: () => void;
  person?: Person | null;
  defaultType: number; 
  people: IPerson[]; 
  addPerson: (person: IPerson) => Promise<void>; 
  editPerson: (person: IPerson) => Promise<void>; 
}

const PersonRegisterModal: React.FC<PersonRegisterModalProps> = ({
  open,
  onClose,
  person,
  defaultType,
  people,
  addPerson,
  editPerson,
}) => {
  const [form, setForm] = useState<Person>({
    name: '',
    email: '',
    phoneNumber: '',
    document: '',
    type: defaultType, 
  });

  const [documentError, setDocumentError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    if (person) {
      setForm(person);
    } else {
      setForm({
        name: '',
        email: '',
        phoneNumber: '',
        document: '',
        type: defaultType, 
      });
    }
  }, [person, defaultType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isDocumentValid = form.type === 1 ? validateCNPJ(form.document) : validateCPF(form.document);
    const isPhoneValid = validatePhone(form.phoneNumber);
    const isEmailValid = validateEmail(form.email);

    setDocumentError(!isDocumentValid);
    setPhoneError(!isPhoneValid);
    setEmailError(!isEmailValid);

    if (!isDocumentValid || !isPhoneValid || !isEmailValid) {
      toast.error(`Verifique os campos: ${form.type === 1 ? 'CNPJ' : 'CPF'}, Telefone e Email devem ser válidos.`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      setIsSubmitting(false);
      return;
    }

    const duplicate = people.some(
      (p) => p.document === form.document && p.type === defaultType && p.id !== person?.id
    );

    if (duplicate) {
      setDocumentError(true);
      toast.error(
        `O ${form.type === 1 ? 'CNPJ' : 'CPF'} ${form.document} já está cadastrado como ${defaultType === 1 ? 'Fornecedor' : 'Cliente'}.`,
        {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        }
      );
      setIsSubmitting(false);
      return;
    }

    try {

      const payload: IPerson = { ...form, type: defaultType };

      if (person) {

        await editPerson(payload);
        toast.success(
          `${defaultType === 1 ? 'Fornecedor' : 'Cliente'} editado com sucesso!`,
          {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'colored',
          }
        );
      } else {

        await addPerson(payload);
        toast.success(
          `${defaultType === 1 ? 'Fornecedor' : 'Cliente'} cadastrado com sucesso!`,
          {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'colored',
          }
        );
      }

      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar pessoa:', error);

      if (error.message.includes("duplicado")) {
        setDocumentError(true);
        toast.error(`O ${form.type === 1 ? 'CNPJ' : 'CPF'} ${form.document} já está cadastrado.`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
      } else {
        toast.error('Erro ao salvar pessoa. Tente novamente mais tarde.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentLabel = form.type === 1 ? 'CNPJ' : 'CPF';
  const documentPlaceholder = form.type === 1 ? 'XX.XXX.XXX/XXXX-XX' : 'XXX.XXX.XXX-XX';
  const documentMask = form.type === 1 ? '99.999.999/9999-99' : '999.999.999-99';

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
            sx={{
              width: '100%',
              fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
              textAlign: 'center',
              marginBottom: 2,
            }}
          >
            {person ? (defaultType === 1 ? 'Editar Fornecedor' : 'Editar Cliente') : (defaultType === 1 ? 'Cadastrar Fornecedor' : 'Cadastrar Cliente')}
          </Typography>
          <Divider />
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              marginTop: 2,
            }}
          >
            <FormControl fullWidth sx={{ marginBottom: 1.5 }}>
              <FormLabel htmlFor="name" sx={{ marginBottom: 0.5 }}>
                Nome completo
              </FormLabel>
              <TextField
                id="name"
                name="name"
                placeholder={`Digite o nome do ${defaultType === 1 ? 'fornecedor' : 'cliente'}`}
                variant="outlined"
                required
                value={form.name}
                onChange={handleChange}
                fullWidth
              />
            </FormControl>

            <FormControl fullWidth error={phoneError} sx={{ marginBottom: 1.5 }}>
              <FormLabel htmlFor="phone" sx={{ marginBottom: 0.5 }}>
                Telefone
              </FormLabel>
              <InputMask
                mask="(99) 99999-9999"
                value={form.phoneNumber}
                placeholder="(XX) XXXXX-XXXX"
                onChange={(e) =>
                  handleChange({ ...e, target: { ...e.target, name: 'phoneNumber' } })
                }
                maskChar=""
              >
                {(inputProps) => (
                  <TextField 
                    {...inputProps} 
                    fullWidth 
                    error={phoneError} 
                    helperText={phoneError ? 'Telefone inválido' : ''}
                  />
                )}
              </InputMask>
            </FormControl>

            <FormControl fullWidth error={documentError} sx={{ marginBottom: 1.5 }}>
              <FormLabel htmlFor="document" sx={{ marginBottom: 0.5 }}>
                {documentLabel}
              </FormLabel>
              <InputMask
                mask={documentMask}
                placeholder={documentPlaceholder}
                value={form.document}
                onChange={(e) =>
                  handleChange({ ...e, target: { ...e.target, name: 'document' } })
                }
                maskChar=""
              >
                {(inputProps) => (
                  <TextField 
                    {...inputProps} 
                    fullWidth 
                    error={documentError} 
                    helperText={documentError ? `${documentLabel} inválido ou duplicado` : ''}
                  />
                )}
              </InputMask>
            </FormControl>

            <FormControl fullWidth error={emailError} sx={{ marginBottom: 1.5 }}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                name="email"
                placeholder="Digite o email"
                required
                variant="outlined"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
              />
              {emailError && <FormHelperText>Email inválido</FormHelperText>}
            </FormControl>

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button onClick={onClose} variant="outlined" color="secondary" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </Box>
          </Box>
        </Card>
      </ModalContainer>
    </Modal>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  people: state.people.people,
  getAllStatus: state.people.getAllStatus,
});

const mapDispatchToProps = (dispatch: any) => ({
  addPerson: bindActionCreators(PeopleActions.actionsCreators.Add, dispatch),
  editPerson: bindActionCreators(PeopleActions.actionsCreators.Edit, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PersonRegisterModal);
