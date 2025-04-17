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
import CheckRequest from "./checkrequest/CheckRequest";
import { BuyersGuide } from "./BuyersGuide";
import { BarCode } from "./BarCode";
import { Pencil } from "./Pencil";
import Login from "./auth/Login";
import Account from "./Account";
// import Layout from "./drivecentric/Layout";
import { BusinessCardGenerator } from "./BusinessCardGenerator";
import { Users } from "./userManagement/Users";
import Layout from "./Layout";
import TakeIn from "./Take-In";
import { ShareQRContact } from "./ShareQRContact";
import ManageRates from "./rates/ManageRates";
import { Stores } from "./stores/Stores";
import { Store } from "./stores/Store";
import LinkManagement from "./linkManagement/LinkManagement";
import InventoryManager from "./inventoryManager/InventoryManager";
import Inventories from "./inventoryManager/Inventories";
import GamePadDemo from "./gamepad/GamePadDemo";
import VoiceDemo from "./gamepad/VoiceDemo";
import ChatBox from "./gamepad/ChatBox";
import TeamsManager from "./teams/TeamsManager";
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
                  <Route path="/voicedemo" component={VoiceDemo} />
                  <ProtectedRoute exact path="/" component={Dashboard} />
                  {/* <ProtectedRoute exact path="/dev/scan" component={ScanTest} /> */}
                  <ProtectedRoute exact path="/dev/pencil" component={Pencil} />
                  <ProtectedRoute
                    exact
                    path="/#:stock"
                    component={VehiclePage}
                  />
                  <ProtectedRoute
                    exact
                    path="/pencil/:quoteId"
                    component={Pencil}
                    title={(params) => [
                      ["PENCIL", "/pencil"],
                      [params.vin, `/pencil/${params.vin}`],
                    ]}
                  />

                  <Layout>
                    <ProtectedRoute
                      path="/gamepaddemo"
                      component={GamePadDemo}
                    />
                    <ProtectedRoute path="/chatbox" component={ChatBox} />
                    <ProtectedRoute
                      exact
                      path="/users/"
                      component={Users}
                      title={[
                        ["HOFB", "/"],
                        ["USERS", "/users"],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/user/me/share"
                      component={ShareQRContact}
                      title={[
                        ["HOFB", "/"],
                        ["USER", "/users"],
                        ["ME", "/account"],
                        ["SHARE", "/user/me/share"],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/account/"
                      component={Account}
                      title={[
                        ["HOFB", "/"],
                        ["ACCOUNT", "/account"],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/user/:uid"
                      component={Account}
                      title={(params) => [
                        ["HOFB", "/"],
                        ["USER", "/users"],
                        [params.uid, `/account/${params.uid}`],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/account/:uid"
                      component={Account}
                      title={(params) => [
                        ["HOFB", "/"],
                        ["ACCOUNT", "/account"],
                        [params.uid, `/account/${params.uid}`],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/account/:uid/vCard"
                      component={BusinessCardGenerator}
                      title={(params) => [
                        ["HOFB", "/"],
                        ["ACCOUNT", "/account"],
                        [params.uid, `/account/${params.uid}`],
                        ["vCard", `/account/${params.uid}/vCard`],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/check"
                      component={CheckRequest}
                      title={[
                        ["HOFB", "/"],
                        ["CHECK REQUEST", "/check"],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/buyers/guide/"
                      component={BuyersGuide}
                      title={[
                        ["HOFB", "/"],
                        ["BUYERS GUIDE", "/buyers/guide"],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/buyers/guide/:vin"
                      component={BuyersGuide}
                      title={(params) => [
                        ["HOFB", "/"],
                        ["BUYERS GUIDE", "/buyers/guide"],
                        [params.vin, `/buyers/guide/${params.vin}`],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/bar/code/"
                      component={BarCode}
                      title={[
                        ["HOFB", "/"],
                        ["BAR CODE", "/bar/code"],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/take-in/"
                      component={TakeIn}
                      title={[
                        ["HOFB", "/"],
                        ["TAKE IN", "/take-in"],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/take-in/:vin"
                      component={TakeIn}
                      title={(params) => [
                        ["HOFB", "/"],
                        ["TAKE IN", "/take-in"],
                        [params.vin, `/take-in/${params.vin}`],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/quote/:vin"
                      component={Quote}
                      title={(params) => [
                        ["QUOTE", "/quote"],
                        [params.vin, `/quote/${params.vin}`],
                      ]}
                    />

                    <ProtectedRoute
                      exact
                      path="/manage/rates"
                      component={ManageRates}
                      title={(params) => [
                        ["MANAGE", "/manage"],
                        ["RATES", `/manage/rates`],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/admin/stores"
                      component={Stores}
                      title={[
                        ["ADMIN", "/"],
                        ["STORES", "/admin/stores"],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/admin/store/:storeId"
                      component={Store}
                      title={(params) => [
                        ["ADMIN", "/"],
                        ["STORE", "/admin/stores"],
                        [params.storeId, "/admin/stores"],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/manage/teams"
                      component={TeamsManager}
                      title={[
                        ["ADMIN", "/"],
                        ["TEAMS", "/manage/teams"],
                      ]}
                    />

                    <ProtectedRoute
                      exact
                      path="/manage/links"
                      component={LinkManagement}
                      title={[
                        ["MANAGE", "/manage"],
                        ["LINKS", "/manage/links"],
                      ]}
                    />
                    <ProtectedRoute
                      exact
                      path="/inventories/"
                      component={Inventories}
                      title={(params) => [["Inventories", "/inventories/"]]}
                    />
                    <ProtectedRoute
                      exact
                      path="/inventory/:inventoryId"
                      component={InventoryManager}
                      title={(params) => [
                        ["Inventories", "/inventories"],
                        [
                          params.inventoryId,
                          `/inventory/${params.inventoryId}`,
                        ],
                      ]}
                    />

                    <ProtectedRoute
                      exact
                      path="/dev/test"
                      component={() => <></>}
                      title={[
                        ["HOFB", "/"],
                        ["DEV TEST", "/dev/test"],
                      ]}
                    />
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
