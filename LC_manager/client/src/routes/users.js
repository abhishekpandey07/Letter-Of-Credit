import RegisterForm from 'views/Users/Register.jsx'
import UsersHome from 'views/Users/UsersHome.jsx'
const UserRoutes = [
  {
    path: "/users/register",
    component: RegisterForm
  },
  { 
    path: "/users",
    component: UsersHome
  },
  { redirect: true, path: "/", to: "/users", navbarName: "Redirect" }
];

export default UserRoutes;
