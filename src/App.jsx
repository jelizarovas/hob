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
// import Layout from "./drivecentric/Layout";
import { BusinessCardGenerator } from "./BusinessCardGenerator";
import { Users } from "./Users";
import Layout from "./Layout";
import TakeIn from "./Take-In";
// import { ScanTest } from "./ScanTest";

const queryClient = new QueryClient();

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
                  <ProtectedRoute exact path="/" component={Dashboard} />
                  {/* <ProtectedRoute exact path="/dev/scan" component={ScanTest} /> */}
                  <ProtectedRoute exact path="/dev/pencil" component={Pencil} />
                  <ProtectedRoute exact path="/#:stock" component={VehiclePage} />

                  <Layout>
                    <ProtectedRoute exact path="/users/" component={Users} />
                    <ProtectedRoute exact path="/account/" component={Account} />
                    <ProtectedRoute exact path="/account/:uid" component={Account} />
                    <ProtectedRoute exact path="/account/:uid/vCard" component={BusinessCardGenerator} />
                    <ProtectedRoute exact path="/check" component={CheckRequest} />
                    <ProtectedRoute exact path="/buyers/guide/" component={BuyersGuide} />
                    <ProtectedRoute exact path="/buyers/guide/:vin" component={BuyersGuide} />
                    <ProtectedRoute exact path="/bar/code/" component={BarCode} />
                    <ProtectedRoute exact path="/take-in/" component={TakeIn} />
                    <ProtectedRoute exact path="/take-in/:vin" component={TakeIn} />
                    <ProtectedRoute exact path="/quote/:vin" component={Quote} />

                    <ProtectedRoute exact path="/dev/test" component={DevPanel} />
                    {/* <ProtectedRoute exact path="/dev/dc" component={Layout} /> */}
                  </Layout>
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
