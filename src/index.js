import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import TradeIdeas from './TradeIdeas';
import 'bootstrap/dist/css/bootstrap.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <TradeIdeas />
  </React.StrictMode>
);
