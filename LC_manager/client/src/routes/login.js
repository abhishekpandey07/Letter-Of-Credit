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
import RegisterPage from 'views/Login/Register.jsx'
import LoginPage from 'views/Login/Login.jsx'

const loginRoutes = [
  {
    path: "/register",
    component: RegisterPage
  },
  {
    path: "/login",
    component: LoginPage
  },

  { redirect: true, path: "/", to: "/register", navbarName: "Redirect" }
];

export default loginRoutes;
