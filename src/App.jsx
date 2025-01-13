import React from 'react';
import {  BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import ThemeRoutes from 'Router/routes.js';
import "../src/views/auth/auth-logic/AxiosConfig.js";

const App = () => {
  return (
    <Router>
    <Routes>
      {ThemeRoutes.map((route, index) => (
        route.children ? (
          <Route key={index} path={route.path} element={route.element}>
            {route.children.map((child, idx) => (
              <Route key={`${index}-${idx}`} path={child.path} element={child.element} />
            ))}
          </Route>
        ) : (
          <Route key={index} path={route.path} element={route.element} />
        )
      ))}
    </Routes>
    </Router>
   
  );
};

export default App;
