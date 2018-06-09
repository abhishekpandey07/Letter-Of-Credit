/*import DashboardPage from "views/Dashboard/Dashboard.jsx";
import UserProfile from "views/UserProfile/UserProfile.jsx";
import TableList from "views/TableList/TableList.jsx";
import Banks from "views/Banks/Banks.jsx"
import Projects from 'views/Projects/Projects.jsx';
import Project from 'views/Project/Project.jsx';
import Typography from "views/Typography/Typography.jsx";
import Icons from "views/Icons/Icons.jsx";
import Maps from "views/Maps/Maps.jsx";
import NotificationsPage from "views/Notifications/Notifications.jsx";
import NewLCForm from 'views/Project/AddNewLCForm.jsx'

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
import NewProjectForm from 'views/Projects/AddNewProject.jsx'
import ProjectHome from 'views/Projects/ProjectHome.jsx'
const ProjectRoutes = [
  {
    path: "/Projects/AddNewProject",
    component: NewProjectForm
  },
  { 
    path: "/Projects",
    component: ProjectHome
  },
  { redirect: true, path: "/", to: "/Projects", navbarName: "Redirect" }
];

export default ProjectRoutes;
