import { ClassProvider } from './ContextAPI/ClassContext';
import MainRoutes from './Routes/MainRoutes';
import { ToastContainer } from 'react-toastify';

const App = () => {
  return (
    <>
      <ClassProvider>
        <MainRoutes />
        <ToastContainer />
      </ClassProvider>
    </>
  );
};

export default App;
