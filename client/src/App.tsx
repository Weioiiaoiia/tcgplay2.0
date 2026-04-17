import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WalletProvider } from "./contexts/WalletContext";
import { CardDataProvider } from "./contexts/CardDataContext";
import Home from "./pages/Home";
import CardDetail from "./pages/CardDetail";
import MyCollection from "./pages/MyCollection";
import MarketLuxe from "./pages/MarketLuxe";
import Roadmap from "./pages/Roadmap";
import Compliance from "./pages/Compliance";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/card/:tokenId" component={CardDetail} />
      <Route path="/market" component={MarketLuxe} />
      <Route path="/collection" component={MyCollection} />
      <Route path="/my-collection" component={MyCollection} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Design reminder for the app shell:
 * keep the whole product inside the fog-white precision-exhibition system,
 * using light as the default canvas and letting routes share the same calm materials.
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <WalletProvider>
          <CardDataProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </CardDataProvider>
        </WalletProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
