import { Dashboard } from "./Dashboard";
import { HashRouter as Router, Route } from "react-router-dom";
import { VehiclePage } from "./vehicle/VehiclePage";

function App() {
  return (
    <Router>
      <Route exact path="/:stock" component={VehiclePage} />
      <Route path="/" component={Dashboard} />
    </Router>
  );
}

export default App;
