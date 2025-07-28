import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import RiskAssessmentPage from "@/pages/risk-assessment";
import RiskRegistryPage from "@/pages/risk-registry";
import RegistryAssessmentPage from "@/pages/registry-assessment";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={RiskAssessmentPage} />
      <Route path="/registry-assessment" component={RegistryAssessmentPage} />
      <Route path="/risk-registry" component={RiskRegistryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
