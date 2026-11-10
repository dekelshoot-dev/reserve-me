import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { AutoUpdateNotifier } from './components/AutoUpdateNotifier.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <AutoUpdateNotifier />
    <App />
  </ErrorBoundary>
);
