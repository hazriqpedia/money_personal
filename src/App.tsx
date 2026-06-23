import { RouterProvider } from 'react-router-dom';
import { AppDataProvider } from './store/AppDataProvider';
import { router } from './router';

function App() {
  return (
    <AppDataProvider>
      <RouterProvider router={router} />
    </AppDataProvider>
  );
}

export default App;
