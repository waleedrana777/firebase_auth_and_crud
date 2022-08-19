import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthProvider from './auth/AuthProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <AuthProvider>
    <React.Suspense fallback={<div>Loading...</div>}>
      <App />
    </React.Suspense>
  </AuthProvider>
);