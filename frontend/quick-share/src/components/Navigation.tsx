import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const customStyles = {
  headerGradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  customNavButton: {
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '20px',
    padding: '8px 16px',
    color: 'white',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'inline-block',
  },
};

function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };

    window.addEventListener('storage', handleStorageChange);
    
    window.addEventListener('authStateChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userCategories');
    localStorage.removeItem('userLanguage');
    localStorage.removeItem('upgradeRequestPending');
    
    setIsLoggedIn(false);
    
    window.dispatchEvent(new Event('authStateChanged'));
    
    navigate('/');
  };

  return (
    <Navbar 
      expand="lg" 
      sticky="top" 
      className="shadow-sm" 
      style={customStyles.headerGradient}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="text-white fw-bold fs-3">
          🎧 QuickDesk
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/" className="text-white mx-2">
              Home
            </Nav.Link>
            
            {isLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/forum" className="text-white mx-2">
                  Forum
                </Nav.Link>
                <Nav.Link as={Link} to="/tickets" className="text-white mx-2">
                  My Tickets
                </Nav.Link>
                <Nav.Link as={Link} to="/create-ticket" className="text-white mx-2">
                  Create Ticket
                </Nav.Link>
                <Nav.Link as={Link} to="/dashboard" className="text-white mx-2">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/profile" className="text-white mx-2">
                  Profile
                </Nav.Link>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                  className="ms-2"
                  style={{ borderRadius: '20px' }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-white mx-2">
                  Login
                </Nav.Link>
                <Link
                  to="/register"
                  className="btn btn-outline-light btn-sm ms-2"
                  style={{ borderRadius: '20px' }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;