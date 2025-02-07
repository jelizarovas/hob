import { Dashboard } from "./Dashboard";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { VehiclePage } from "./vehicle/VehiclePage";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DevPanel } from "./dev/DevPanel";
import { SettingsProvider } from "./SettingsContext";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { VehicleProvider } from "./VehicleContext";
import { Quote } from "./quote/Quote";
import { CheckRequest } from "./CheckRequest";
import { BuyersGuide } from "./BuyersGuide";
import { BarCode } from "./BarCode";
import { Pencil } from "./Pencil";
import Login from "./auth/Login";
import Account from "./Account";
import Layout from "./drivecentric/Layout";
import { BusinessCardGenerator } from "./BusinessCardGenerator";
import { Users } from "./Users";
import TakeIn from "./vehicle/Take-In";

const queryClient = new QueryClient();
// import useSettings from "./hooks/useSettings";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <QueryClientProvider client={queryClient}>
          <VehicleProvider>
            <ThemeProvider theme={darkTheme}>
              <CssBaseline />
              <Router>
                <Switch>
                  <Route path="/login" component={Login} />
                  <ProtectedRoute exact path="/users/" component={Users} />
                  <ProtectedRoute exact path="/account/" component={Account} />
                  <ProtectedRoute
                    exact
                    path="/account/:uid"
                    component={Account}
                  />
                  <ProtectedRoute
                    exact
                    path="/account/:uid/vCard"
                    component={BusinessCardGenerator}
                  />
                  <ProtectedRoute exact path="/dev/test" component={DevPanel} />
                  <ProtectedRoute exact path="/dev/dc" component={Layout} />
                  <Route exact path="/dev/pencil" component={Pencil} />
                  <ProtectedRoute
                    exact
                    path="/check/req"
                    component={CheckRequest}
                  />
                  <ProtectedRoute
                    path="/buyers/guide/"
                    component={BuyersGuide}
                  />
                  <ProtectedRoute path="/bar/code/" component={BarCode} />
                  <ProtectedRoute
                    path="/buyers/guide/:vin"
                    component={BuyersGuide}
                  />
                  <ProtectedRoute
                    path="/take-in/:vin"
                    component={TakeIn}
                  />

                  <ProtectedRoute
                    exact
                    path="/:stock"
                    component={VehiclePage}
                  />

                  <Route exact path="/quote/:vin" component={Quote} />

                  <ProtectedRoute exact path="/" component={Dashboard} />
                </Switch>
              </Router>
            </ThemeProvider>
          </VehicleProvider>
        </QueryClientProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
