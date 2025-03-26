import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import axios from 'axios';
import createAuthRefreshInterceptor from './utils/createAuthRefreshInterceptor';
import { UNSAFE_DEFERRED_ROUTE_TRANSITIONS, UNSAFE_RELATIVE_SPLAT_PATH } from '@remix-run/router';

// Enable React Router future flags
window.__remixRouterFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

// Set default base URL for axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Initialize auth refresh interceptor
createAuthRefreshInterceptor();

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
