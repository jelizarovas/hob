import { Dashboard } from "./Dashboard";
import { HashRouter as Router, Route } from "react-router-dom";
import { VehiclePage } from "./vehicle/VehiclePage";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DevPanel } from "./dev/DevPanel";
import { SettingsProvider } from "./SettingsContext";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { VehicleProvider } from "./VehicleContext";
import { Quote } from "./Quote";

const queryClient = new QueryClient();
// import useSettings from "./hooks/useSettings";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <SettingsProvider>
      <QueryClientProvider client={queryClient}>
        <VehicleProvider>
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Router>
              <Route exact path="/dev/test" component={DevPanel} />
              <Route exact path="/:stock" component={VehiclePage} />
              <Route exact path="/quote/:vin" component={Quote} />
              <Route exact path="/" component={Dashboard} />
            </Router>
          </ThemeProvider>
        </VehicleProvider>
      </QueryClientProvider>
    </SettingsProvider>
  );
}

export default App;
