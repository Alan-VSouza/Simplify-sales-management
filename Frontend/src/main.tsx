import { createRoot } from 'react-dom/client'
import '@assets/css/index.css'
import App from './App.tsx'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import configureStore from '@store/configureStore.ts'
import { installMockApi } from './demo/mockApi'
import DemoBanner from './demo/DemoBanner'

// Public demo build (VITE_DEMO=true): fake API in the browser and a signed-in demo user.
const isDemo = import.meta.env.VITE_DEMO === 'true';
if (isDemo) {
  installMockApi();
  try { if (!localStorage.getItem('authToken')) localStorage.setItem('authToken', 'demo-token'); } catch { /* ignore */ }
}

const store = configureStore();

createRoot(document.getElementById('root')!).render(
  <React.Fragment>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        {isDemo && <DemoBanner />}
      </BrowserRouter>
    </Provider>
  </React.Fragment>,
)
