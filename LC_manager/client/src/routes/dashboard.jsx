import DashboardPage from "views/Dashboard/Dashboard.jsx";
import UserProfile from "views/UserProfile/UserProfile.jsx";
import TableList from "views/TableList/TableList.jsx";
import Banks from "views/Banks/Banks.jsx"
import Suppliers from 'views/Suppliers/Suppliers.jsx';
import LCs from 'views/LCs/LCs.jsx';
import Typography from "views/Typography/Typography.jsx";
import Icons from "views/Icons/Icons.jsx";
import Maps from "views/Maps/Maps.jsx";
import NotificationsPage from "views/Notifications/Notifications.jsx";
import Users from 'views/Users/Users.jsx';
import Projects from 'views/Projects/Projects.jsx';

import {
  Dashboard,
  Person,
  ContentPaste,
  LibraryBooks,
  BubbleChart,
  LocationOn,
  Notifications,
  Home
} from "@material-ui/icons";

const dashboardRoutes = [
  {
    path: "/dashboard",
    sidebarName: "Dashboard",
    navbarName: "Material Dashboard",
    icon: Dashboard,
    component: DashboardPage,
    roles: ['admin','read','readWrite']
  },/*
  {
    path: "/user",
    sidebarName: "User Profile",
    navbarName: "Profile",
    icon: Person,
    component: UserProfile
  },
  {
    path: "/table",
    sidebarName: "Table List",
    navbarName: "Table List",
    icon: ContentPaste,
    component: TableList
  },
  {
    path: "/typography",
    sidebarName: "Typography",
    navbarName: "Typography",
    icon: LibraryBooks,
    component: Typography
  },
  {
    path: "/icons",
    sidebarName: "Icons",
    navbarName: "Icons",
    icon: BubbleChart,
    component: Icons
  },
  /*{
    path: "/maps",
    sidebarName: "Maps",
    navbarName: "Map",
    icon: LocationOn,
    component: Maps
  },
  {
    path: "/notifications",
    sidebarName: "Notifications",
    navbarName: "Notifications",
    icon: Notifications,
    component: NotificationsPage
  },*/
  {
    path: "/banks",
    sidebarName: "Banks",
    icon: Home,
    component: Banks,
    navbarName: "Bank Accounts And Information",
    roles: ['admin','read','readWrite']
  },
  {
    path: "/suppliers",
    sidebarName: "Suppliers",
    icon: Person,
    component: Suppliers,
    navbarName: "Suppliers Information",
    roles: ['admin','read','readWrite']
  },
  {
    path: "/LCs",
    sidebarName: "Letters Of Credit",
    icon: LibraryBooks,
    component: LCs,
    navbarName: "Letters of Credit",
    roles: ['admin','read','readWrite']
  },
  {
    path: "/projects",
    sidebarName: "Projects",
    icon: ContentPaste,
    component: Projects,
    navbarName: "Projects Information",
    roles: ['admin','read','readWrite']
  },
  {
    path: '/users',
    sidebarName: 'Users',
    icon: Person,
    component: Users,
    navbarName: 'Users',
    roles: ['admin']
  },
  { redirect: true, path: "/", to: "/dashboard", navbarName: "Redirect" }
];

export default dashboardRoutes;
