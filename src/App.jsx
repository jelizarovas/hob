import { Check } from "./Check";
import { Navbar } from "./Navbar";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import ModalComponent from "./ModalComponent";
import { QRScanner } from "./QRScanner";

function App({ children }) {
  return (
    <Router>
      {/* <QRScanner /> */}
      {/* <Navbar /> */}
      <Route exact path="/:stock" component={ModalComponent} />
      <Route path="/" component={Check} />
    </Router>
  );
}

export default App;
