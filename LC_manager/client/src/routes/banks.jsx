/*import DashboardPage from "views/Dashboard/Dashboard.jsx";
import UserProfile from "views/UserProfile/UserProfile.jsx";
import TableList from "views/TableList/TableList.jsx";
import Banks from "views/Banks/Banks.jsx"
import Suppliers from 'views/Suppliers/Suppliers.jsx';
import LCs from 'views/LCs/LCs.jsx';
import Typography from "views/Typography/Typography.jsx";
import Icons from "views/Icons/Icons.jsx";
import Maps from "views/Maps/Maps.jsx";
import NotificationsPage from "views/Notifications/Notifications.jsx";
import NewLCForm from 'views/LCs/AddNewLCForm.jsx'

import {
  Dashboard,
  Person,
  ContentPaste,
  LibraryBooks,
  BubbleChart,
  LocationOn,
  Notifications
} from "@material-ui/icons";
*/
import NewBankForm from 'views/Banks/AddBank.jsx'
import BankHome from 'views/Banks/BanksHome.jsx'
const BankRoutes = [
  {
    path: "/Banks/AddNewBank",
    component: NewBankForm
  },
  { 
    path: "/Banks",
    component: BankHome
  },
  { redirect: true, path: "/", to: "/Banks", navbarName: "Redirect" }
];

export default BankRoutes;
