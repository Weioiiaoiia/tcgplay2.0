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
import MarketIndex from "./pages/MarketIndex";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/card/:tokenId" component={CardDetail} />
      <Route path="/market" component={MarketIndex} />
      <Route path="/my-collection" component={MyCollection} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
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
