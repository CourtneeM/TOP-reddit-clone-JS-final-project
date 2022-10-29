import React from 'react';
import ReactDOM from 'react-dom/client';
import RouteSwitch from './RouteSwitch';

import { LogInOutProvider } from './Components/Contexts/LogInOutContext';
import { UserProvider } from './Components/Contexts/UserContext';

import './index.css';
import { SubProvider } from './Components/Contexts/SubContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LogInOutProvider>
      <UserProvider>
        <SubProvider>
          <RouteSwitch />
        </SubProvider>
      </UserProvider>
    </LogInOutProvider>
  </React.StrictMode>
);
