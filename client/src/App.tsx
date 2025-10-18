import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import SitePasswordGate from "./pages/SitePasswordGate";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Menu from "./pages/Menu";
import Suno from "./pages/Suno";
import SunoPost from "./pages/SunoPost";
import SunoDetail from "./pages/SunoDetail";
import Manus from "./pages/Manus";
import ManusChat from "./pages/ManusChat";
import ManusQuestions from "./pages/ManusQuestions";
import ManusQuestionNew from "./pages/ManusQuestionNew";
import ManusQuestionDetail from "./pages/ManusQuestionDetail";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={SitePasswordGate} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/verify-email"} component={VerifyEmail} />
      <Route path={"/menu"} component={Menu} />
      <Route path={"/suno"} component={Suno} />
      <Route path={"/suno/post"} component={SunoPost} />
      <Route path={"/suno/:id"} component={SunoDetail} />
      <Route path={"/manus"} component={Manus} />
      <Route path={"/manus/chat"} component={ManusChat} />
      <Route path={"/manus/questions"} component={ManusQuestions} />
      <Route path={"/manus/questions/new"} component={ManusQuestionNew} />
      <Route path={"/manus/questions/:id"} component={ManusQuestionDetail} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
