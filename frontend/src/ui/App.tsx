import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NewTraining from './pages/NewTraining';
import TrainingHistory from './pages/TrainingHistory';
import ErrorPage from './pages/ErrorPage';
import SettingsPage from './pages/Settings';
import HomePage from './pages/HomePage';

<<<<<<< HEAD
=======
export const CONTRACT_ID = '0.0.6914933';
>>>>>>> 550cfdf (add encryption of weights url)
function App() {
  
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route element={<Layout />}>
        <Route path='training' element={<NewTraining />} />
        <Route path='history' element={<TrainingHistory />} />
        <Route path='settings' element={<SettingsPage />} />
      </Route>
      <Route path='*' element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
