// App.tsx
import './css/App.css'
import './css/index.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Account from './components/Account/AccountPage';
import Chat from './components/Chat/ChatPage';
import { Route as CRoute } from './constantes';
import Register from './components/LoginRegister/Register';
import Login from './components/LoginRegister/Login';
import Header from './components/shared/header';
import Footer from './components/shared/footer';
import { AuthProvider } from './components/shared/auth-context';
import HomePage from './components/HomePage/HomePage';
import Publications from './components/Publications/PublicationsPage';
import Activity from './components/Activity/ActivityPage';
import Trocs from './components/Trocs/TrocsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path={CRoute.account} element={<Account />} />
          <Route path={CRoute.activity} element={<Activity />} />
          <Route path={`${CRoute.chat}`} element={<Chat />} />
          <Route path={`${CRoute.chat}/:id`} element={<Chat />} />
          <Route path={CRoute.base} element={<HomePage />} />
          <Route path={CRoute.login} element={<Login />} />
          <Route path={`${CRoute.publications}`} element={<Publications />} />
          <Route path={CRoute.register} element={<Register />} />
          <Route path={CRoute.troc} element={<Trocs />} />
          {/* ... autres routes */}
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
