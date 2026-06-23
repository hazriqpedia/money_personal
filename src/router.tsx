import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TABS } from './config/tabs';
import { AboutPage } from './components/AboutPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      ...TABS.map(({ path, Component }) => ({ path, element: <Component /> })),
      { path: '/about', element: <AboutPage /> },
    ],
  },
]);
