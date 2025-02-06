import './assets/css/App.css';
import { Route, Routes, Navigate } from 'react-router';
import Layout from '@pages/shared/Layout';
import Dashboard from '@pages/Home/Dashboard';
import Transaction from '@pages/Transaction/Transaction';
import Product from '@pages/Product/Product';
import Supplier from '@pages/Supplier/Supplier';
import Cart from '@pages/Cart/Cart';
import Stock from '@pages/Stock/Stock';
import Client from '@pages/Client/Client';

import { createTheme, CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import Login from '@pages/Register/Login';
import Register from '@pages/Register/Register';

const theme = createTheme({
  palette: {
    background: {
      default: '#ffff', 
    },
  },
});

const globalStyles = (
  <GlobalStyles
    styles={{
      body: {
        backgroundColor: '#ffff', 
        margin: 0,
        padding: 0,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        height: '100%', 
        boxSizing: 'border-box',
      },
    }}
  />
);

function App() {
  const isAuthenticated = !!localStorage.getItem('authToken'); 

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout /> 
            ) : (
              <Navigate to="/login" replace /> 
            )
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/product" element={<Product />} />
          <Route path="/supplier" element={<Supplier />} />
          <Route path="/supplier/register" element={<Supplier />} />
          <Route path="/client" element={<Client />} />
          <Route path="/client/register" element={<Client />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/cart" element={<Cart />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
