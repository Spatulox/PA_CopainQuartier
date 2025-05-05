// App.tsx
import './css/App.css'
import './css/index.css'

import { AuthProvider } from "./shared/auth-context";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './shared/header';
import Footer from './shared/footer';
import Login from './pages/login';
import Register from './pages/register';
import Account from './pages/account';
import HomePage from './pages/home_page';
import Chat from './pages/chat';
import { Route as CRoute } from './constantes';
import Publications from "./pages/publications";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path={CRoute.base} element={<HomePage />} />
          <Route path={CRoute.login} element={<Login />} />
          <Route path={CRoute.register} element={<Register />} />
          <Route path={CRoute.account} element={<Account />} />
          <Route path={`${CRoute.publications}`} element={<Publications />} />
          <Route path={`${CRoute.chat}`} element={<Chat />} />
          <Route path={`${CRoute.chat}/:id`} element={<Chat />} />
          {/* ... autres routes */}
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
