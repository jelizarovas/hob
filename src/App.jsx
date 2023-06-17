import { Check } from "./Check";
import { Navbar } from "./Navbar";
import { HashRouter as Router, Route, Routes, Switch } from "react-router-dom";
import ModalComponent from "./ModalComponent";
import { QRScanner } from "./QRScanner";

function App({ children }) {
  return (
    <Router>
      {/* <QRScanner /> */}
      {/* <Navbar /> */}
      <Routes>
        <Route exact path="/stock/:stock" component={ModalComponent} />
        <Route path="/" component={Check} />
      </Routes>
    </Router>
  );
}

export default App;
