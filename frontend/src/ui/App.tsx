import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NewTraining from './pages/NewTraining';
import TrainingHistory from './pages/TrainingHistory';
import ErrorPage from './pages/ErrorPage';
import SettingsPage from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<NewTraining />} />
        <Route path='history' element={<TrainingHistory />} />
        <Route path='settings' element={<SettingsPage />} />
      </Route>
      <Route path='*' element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
