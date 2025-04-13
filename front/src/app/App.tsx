// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './shared/header';
import Footer from './shared/footer';
import AuthForm from './pages/auth_register';
import HomePage from './pages/home_page';

import './css/App.css'
import './css/index.css'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthForm />} />
        {/* ... autres routes */}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App
