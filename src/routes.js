// Digital Boarding React layouts
import Dashboard from "layouts/dashboard";
import SignIn from "layouts/authentication/sign-in";
import Registration from "layouts/registration";
import HiringRequest from "layouts/hiringrequest";
import RaisedRequest from "layouts/raisedrequest";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ImageIcon from "@mui/icons-material/Image";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import CategoryIcon from "@mui/icons-material/Category";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StyleIcon from "@mui/icons-material/Style";
import Categories from "layouts/categories";
import Subcategories from "layouts/subcategories";
import Departments from "layouts/departments";
import EventRegistration from "layouts/eventregistration";
// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <AssessmentIcon sx={{ fontSize: "30px !important" }} />,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Categories",
    key: "categories",
    icon: <CategoryIcon sx={{ fontSize: "30px !important" }} />,
    route: "/categories",
    component: <Categories />,
  },
  {
    type: "collapse",
    name: "Subcategories",
    key: "subcategories",
    icon: <CategoryIcon sx={{ fontSize: "30px !important" }} />,
    route: "/subcategories",
    component: <Subcategories />,
  },
  {
    type: "collapse",
    name: "Geek Registrations",
    key: "eventregistration",
    icon: <SwitchAccountIcon sx={{ fontSize: "26px !important" }} />,
    route: "/eventregistration",
    component: <EventRegistration />,
  },
  {
    type: "collapse",
    name: "Seeker Registrations",
    key: "registration",
    icon: <AssignmentIndIcon sx={{ fontSize: "26px !important" }} />,
    route: "/registration",
    component: <Registration />,
  },
  {
    type: "collapse",
    name: "Raised Request",
    key: "raisedrequest",
    icon: <AssignmentTurnedInIcon sx={{ fontSize: "30px !important" }} />,
    route: "/raisedrequest",
    component: <RaisedRequest />,
  },
  {
    type: "collapse",
    name: "Hiring Reports",
    key: "hiringrequest",
    icon: <VerifiedUserIcon sx={{ fontSize: "26px !important" }} />,
    route: "/hiringrequest",
    component: <HiringRequest />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;
