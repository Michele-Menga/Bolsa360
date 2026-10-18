import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import PublicLayout from '../components/layout/PublicLayout'
import HomePage from '../pages/HomePage'
import OportunidadesPage from '../pages/OportunidadesPage'
import NaoEncontradoPage from '../pages/NaoEncontradoPage'

export const router = createBrowserRouter([
{
      element: <PublicLayout />,
      children: [
        { path: '/', element: <HomePage /> },
        { path: '/oportunidades', element: <OportunidadesPage /> },
        { path: '/login', element: <LoginPage /> },
      ],
},
  {path: '*',element: <NaoEncontradoPage />,},
])