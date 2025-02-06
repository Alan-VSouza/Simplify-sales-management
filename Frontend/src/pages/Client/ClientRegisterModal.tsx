/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';
import { Modal,Box,TextField,Button,Typography,Divider,FormLabel,FormControl, } from '@mui/material';
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

interface PersonRegisterModalProps {
  open: boolean;
  onClose: () => void;
  person?: IPerson | null;
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
  people = [],
  addPerson,
  editPerson,
}) => {
  const [form, setForm] = useState<IPerson>({
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
      setForm({ ...person, type: defaultType });
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

    const isDocumentValid = defaultType === 1 ? validateCNPJ(form.document) : validateCPF(form.document);
    const isPhoneValid = validatePhone(form.phoneNumber);
    const isEmailValid = validateEmail(form.email);

    setDocumentError(!isDocumentValid);
    setPhoneError(!isPhoneValid);
    setEmailError(!isEmailValid);

    if (!isDocumentValid || !isPhoneValid || !isEmailValid) {
      toast.error('Verifique os campos inválidos.', { position: 'top-right' });
      setIsSubmitting(false);
      return;
    }

    const peopleList = Array.isArray(people) ? people : [];
    const duplicate = peopleList.some(
      (p) => p.document === form.document && p.type === defaultType && p.id !== person?.id
    );

    if (duplicate) {
      setDocumentError(true);
      toast.error('Documento já cadastrado.', { position: 'top-right' });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = { ...form };

      if (person) {
        await editPerson(payload);
        toast.success('Cliente editado com sucesso!', { position: 'top-right' });
      } else {
        await addPerson(payload);
        toast.success('Cliente cadastrado com sucesso!', { position: 'top-right' });
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar cliente.', { position: 'top-right' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {person ? 'Editar Cliente' : 'Cadastrar Cliente'}
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
                placeholder="Digite o nome do cliente"
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
                  <TextField {...inputProps} fullWidth error={phoneError} helperText={phoneError ? 'Telefone inválido' : ''} />
                )}
              </InputMask>
            </FormControl>

            <FormControl fullWidth error={documentError} sx={{ marginBottom: 1.5 }}>
              <FormLabel htmlFor="document" sx={{ marginBottom: 0.5 }}>
                CPF
              </FormLabel>
              <InputMask
                mask="999.999.999-99"
                placeholder="XXX.XXX.XXX-XX"
                value={form.document}
                onChange={(e) =>
                  handleChange({ ...e, target: { ...e.target, name: 'document' } })
                }
                maskChar=""
              >
                {(inputProps) => (
                  <TextField {...inputProps} fullWidth error={documentError} helperText={documentError ? 'CPF inválido ou duplicado' : ''} />
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
  people: state.people?.people || [],
});

const mapDispatchToProps = (dispatch: any) => ({
  addPerson: bindActionCreators(PeopleActions.actionsCreators.Add, dispatch),
  editPerson: bindActionCreators(PeopleActions.actionsCreators.Edit, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PersonRegisterModal);
