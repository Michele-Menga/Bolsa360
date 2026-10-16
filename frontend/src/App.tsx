import { Routes, Route, Link } from 'react-router-dom';
import { LoginPage } from './pages/loginPage';
import { RegisterPage } from './pages/registerPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* Barra de Navegação Simples */}
      <header className="bg-white shadow p-4 mb-6 flex justify-between items-center max-w-4xl mx-auto rounded-b">
        <h1 className="text-xl font-bold text-blue-600">
          <Link to="/">Bolsa360</Link>
        </h1>
        <nav className="space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">
            Entrar
          </Link>
          <Link to="/register" className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium">
            Criar Conta
          </Link>
        </nav>
      </header>

      {/* Conteúdo das Rotas */}
      <main className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;