import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NewTraining from './pages/NewTraining';
import TrainingHistory from './pages/TrainingHistory';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<NewTraining />} />
        <Route path='history' element={<TrainingHistory />} />
      </Route>
      <Route path='*' element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;
