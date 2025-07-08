// App.tsx
import './css/App.css'
import './css/index.css'
import './components/Account/Account.css';


import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Account, { ManageMyAccount } from './components/Account/AccountPage';
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
import ManageTroc, { ManageMyTroc } from './components/Trocs/TrocManage';
import ManageChat from './components/Chat/ChatManage';
import ManageUser from './components/Users/UserManage';
import NotFound from './components/shared/notfound';
import Users from './components/Users/UserPage';
import DisplayInvite from './components/shared/DisplayInvite';
import MyFriends from './components/Friends/MyFriends';
import MyFriendRequest from './components/Friends/MyFriendsRequest';
import SingleFriends from './components/Friends/SingleFriends';
import Langaje from './components/Langaje/Langaje';
import JavaList from './components/Java/JavaList';

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
          <Route path={`${CRoute.invite}/:id`} element={<DisplayInvite />}></Route>


          <Route path={CRoute.account} element={<Account />} />
          <Route path={CRoute.manageMyAccount} element={<ManageMyAccount />} />
          <Route path={`${CRoute.chat}`} element={<Chat />} />
          <Route path={`${CRoute.chat}/:id`} element={<Chat />} />
          <Route path={`${CRoute.manageChannels}`} element={<ManageChat />} />
          <Route path={`${CRoute.manageChannels}/:id`} element={<ManageChat />} />


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
          <Route path={CRoute.manageTrocs} element={<ManageTroc />} />
          <Route path={`${CRoute.manageTrocs}/:id`} element={<ManageTroc />} />
          <Route path={`${CRoute.manageMyTrocs}`} element={<ManageMyTroc />} />

          <Route path={CRoute.user} element={<Users />} />
          <Route path={`${CRoute.user}/:id`} element={<Users />} />
          <Route path={CRoute.manageUser} element={<ManageUser />} />
          <Route path={`${CRoute.manageUser}/:id`} element={<ManageUser />} />

          <Route path={CRoute.friends} element={<MyFriends />} />
          <Route path={`${CRoute.friends}/:id`} element={<SingleFriends />} />
          <Route path={`${CRoute.friendsRequest}`} element={<MyFriendRequest />} />


          <Route path={`${CRoute.requestDB}`} element={<Langaje />} />
          <Route path={`${CRoute.java}`} element={<JavaList />} />


          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
