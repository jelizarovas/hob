import { Dashboard } from "./Dashboard";
import { HashRouter as Router, Route } from "react-router-dom";
import { VehiclePage } from "./vehicle/VehiclePage";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DevPanel } from "./dev/DevPanel";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Route exact path="/dev/test" component={DevPanel} />
        <Route exact path="/:stock" component={VehiclePage} />
        <Route exact path="/" component={Dashboard} />
      </Router>
    </ThemeProvider>
  );
}

export default App;
