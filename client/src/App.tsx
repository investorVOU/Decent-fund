import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";
import SubmitProposal from "@/pages/SubmitProposal";
import { Suspense, lazy, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Admin authentication protection
function ProtectedAdminRoute() {
  const [, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if admin is authenticated by sending a verification request
        const response = await fetch('/api/admin/verify', {
          credentials: 'include' // Important for cookies/session
        });
        
        const data = await response.json();
        
        if (response.ok && data.authenticated) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          setLocation('/admin-login');
        }
      } catch (error) {
        setIsAuthorized(false);
        setLocation('/admin-login');
      }
    };

    checkAuth();
  }, [setLocation]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthorized === false) {
    return null; // Redirect will happen due to setLocation
  }

  return <Admin />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/admin" component={ProtectedAdminRoute}/>
      <Route path="/admin-login" component={AdminLogin}/>
      <Route path="/submit" component={SubmitProposal}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
