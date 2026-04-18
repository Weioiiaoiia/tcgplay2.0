import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WalletProvider } from "./contexts/WalletContext";
import { CardDataProvider } from "./contexts/CardDataContext";
import { CollectorDataProvider } from "./contexts/CollectorDataContext";
import Home from "./pages/Home";
import IntelFeed from "./pages/IntelFeed";
import Alerts from "./pages/Alerts";
import MetaHeatmap from "./pages/MetaHeatmap";
import ROIPredictions from "./pages/ROIPredictions";
import Web3Board from "./pages/Web3Board";
import EngineStatus from "./pages/EngineStatus";
import CardDetail from "./pages/CardDetail";
import MyCollection from "./pages/MyCollection";
import MarketLuxe from "./pages/MarketLuxe";
import Roadmap from "./pages/Roadmap";
import Compliance from "./pages/Compliance";
import Features from "./pages/Features";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/intel" component={IntelFeed} />
      <Route path="/intel/alerts" component={Alerts} />
      <Route path="/intel/meta" component={MetaHeatmap} />
      <Route path="/intel/roi" component={ROIPredictions} />
      <Route path="/intel/web3" component={Web3Board} />
      <Route path="/intel/engine" component={EngineStatus} />
      <Route path="/card/:tokenId" component={CardDetail} />
      <Route path="/market" component={MarketLuxe} />
      <Route path="/collection" component={MyCollection} />
      <Route path="/my-collection" component={MyCollection} />
      <Route path="/features" component={Features} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <WalletProvider>
          <CardDataProvider>
            <CollectorDataProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
            </CollectorDataProvider>
          </CardDataProvider>
        </WalletProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
