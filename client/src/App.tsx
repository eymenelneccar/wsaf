import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Income from "@/pages/income";
import Expenses from "@/pages/expenses";
import Prints from "@/pages/prints";
import Employees from "@/pages/employees";
import Reports from "@/pages/reports";
import UserManagement from "@/pages/user-management";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/customers" component={Customers} />
          <Route path="/income" component={Income} />
          <Route path="/expenses" component={Expenses} />
          <Route path="/prints" component={Prints} />
          <Route path="/employees" component={Employees} />
          <Route path="/reports" component={Reports} />
          <Route path="/user-management" component={UserManagement} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="font-arabic min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white" dir="rtl">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
