import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import { PortfolioProvider } from './context/PortfolioContext';

function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/' element={<Home />} />
          </Routes>
        </Router>
      </PortfolioProvider>
    </AuthProvider>
  )
}

export default App;
