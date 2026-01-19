import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import FloatingWidget from './components/Widget/FloatingWidget';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <FloatingWidget />
    </React.StrictMode>
);
