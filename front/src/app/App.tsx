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
import ActivityComponent from './components/Activity/ActivityPage';
import Trocs from './components/Trocs/TrocsPage';
import ResetPassword from './components/LoginRegister/ResetPassword';
import ManageActivity, { ManageMyActivity } from './components/Activity/ActivityManage';
import ManagePublication, { ManageMyPublications } from './components/Publications/PublicationManage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <main>
        <Routes>
          <Route path={`${CRoute.chat}/:id`} element={<Chat />} />
          <Route path={CRoute.base} element={<HomePage />} />
          <Route path={CRoute.login} element={<Login />} />
          <Route path={CRoute.register} element={<Register />} />
          <Route path={CRoute.resetPassword} element={<ResetPassword />} />


          <Route path={CRoute.account} element={<Account />} />
          <Route path={`${CRoute.chat}`} element={<Chat />} />


          <Route path={CRoute.activity} element={<ActivityComponent />} />
          <Route path={`${CRoute.activity}/:id`} element={<ActivityComponent />} />
          <Route path={CRoute.manageActivity} element={<ManageActivity />} />
          <Route path={`${CRoute.manageActivity}/:id`} element={<ManageActivity />} />
          <Route path={`${CRoute.manageMyActivity}`} element={<ManageMyActivity />} />


          <Route path={`${CRoute.publications}`} element={<Publications />} />
          <Route path={`${CRoute.publications}/:id`} element={<Publications />} />
          <Route path={`${CRoute.managePublications}`} element={<ManagePublication />} />
          <Route path={`${CRoute.managePublications}/:id`} element={<ManagePublication />} />
          <Route path={`${CRoute.manageMyPublications}`} element={<ManageMyPublications />} />

          <Route path={CRoute.troc} element={<Trocs />} />
          <Route path={`${CRoute.troc}/:id`} element={<Trocs />} />
          <Route path={CRoute.manageTrocs} element={<Trocs />} />
          <Route path={`${CRoute.manageTrocs}/:id`} element={<Trocs />} />
          <Route path={`${CRoute.manageMyTrocs}`} element={<Trocs />} />
          {/* ... autres routes */}
        </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
