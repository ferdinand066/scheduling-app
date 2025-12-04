import React from "react";
import "./App.css";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Dashboard from "./layouts/Dashboard";
import Home from "./pages/Home";
import Shift from "./pages/shift/Shift";
import ShiftForm from "./pages/shift-form/ShiftForm";
import { ThemeProvider } from "@mui/material";
import { staffanyTheme } from "./commons/theme";
import ErrorBoundary from "./components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={staffanyTheme}>
          <BrowserRouter>
            <Switch>
              <Route exact path="/">
                <Dashboard>
                  <Home />
                </Dashboard>
              </Route>
              <Route exact path="/shift">
                <Dashboard>
                  <Shift />
                </Dashboard>
              </Route>
              <Route exact path="/shift/add">
                <Dashboard>
                  <ShiftForm />
                </Dashboard>
              </Route>
              <Route exact path="/shift/:id/edit">
                <Dashboard>
                  <ShiftForm />
                </Dashboard>
              </Route>
            </Switch>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
