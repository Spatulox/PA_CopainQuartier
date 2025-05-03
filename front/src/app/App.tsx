// App.tsx
import { AuthProvider } from "./shared/auth-context";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './shared/header';
import Footer from './shared/footer';
import AuthForm from './pages/auth_register';
import Account from './pages/account';
import HomePage from './pages/home_page';
import Chat from './pages/chat';
import { Route as CRoute } from './constantes';

import './css/App.css'
import './css/index.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path={CRoute.base} element={<HomePage />} />
          <Route path={CRoute.auth} element={<AuthForm />} />
          <Route path={CRoute.account} element={<Account />} />
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
