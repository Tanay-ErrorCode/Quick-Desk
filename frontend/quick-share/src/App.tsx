import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./screens/HomePage";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/tickets"
            element={
              <div className="container mt-5">
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <div className="card">
                      <div className="card-body text-center">
                        <h2>My Tickets</h2>
                        <p className="text-muted">Coming soon...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          <Route
            path="/create-ticket"
            element={
              <div className="container mt-5">
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <div className="card">
                      <div className="card-body text-center">
                        <h2>Create New Ticket</h2>
                        <p className="text-muted">Coming soon...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          <Route
            path="/dashboard"
            element={
              <div className="container mt-5">
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <div className="card">
                      <div className="card-body text-center">
                        <h2>Dashboard</h2>
                        <p className="text-muted">Coming soon...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          <Route
            path="/profile"
            element={
              <div className="container mt-5">
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <div className="card">
                      <div className="card-body text-center">
                        <h2>Profile</h2>
                        <p className="text-muted">Coming soon...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          <Route
            path="*"
            element={
              <div className="container mt-5">
                <div className="row justify-content-center">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body text-center">
                        <h1 className="display-1">404</h1>
                        <h2>Page Not Found</h2>
                        <p className="text-muted">
                          The page you're looking for doesn't exist.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
