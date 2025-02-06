import { createRoot } from 'react-dom/client'
import '@assets/css/index.css'
import App from './App.tsx'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import configureStore from '@store/configureStore.ts'

const store = configureStore();

createRoot(document.getElementById('root')!).render(
  <React.Fragment>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.Fragment>,
)
