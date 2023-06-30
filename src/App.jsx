import { Dashboard } from "./Dashboard";
import { HashRouter as Router, Route } from "react-router-dom";
import { VehiclePage } from "./vehicle/VehiclePage";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

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
        <Route exact path="/:stock" component={VehiclePage} />
        <Route path="/" component={Dashboard} />
      </Router>
    </ThemeProvider>
  );
}

export default App;
