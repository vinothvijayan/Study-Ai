
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebase";
import NavigationHeader from "./components/NavigationHeader";
import StudyAssistant from "./components/StudyAssistant";
import StudyHistory from "./components/StudyHistory";
import UserProfile from "./components/UserProfile";
import ArivuChatbot from "./components/ArivuChatbot";
import LandingPage from "./components/LandingPage";
import { AppProvider } from "./contexts/AppContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const [user, loading] = useAuthState(auth);
  const [currentView, setCurrentView] = useState("study");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "history":
        return <StudyHistory />;
      case "profile":
        return <UserProfile />;
      case "arivu":
        return <ArivuChatbot />;
      default:
        return <StudyAssistant />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <NavigationHeader 
        currentView={currentView} 
        onViewChange={setCurrentView}
      />
      {renderCurrentView()}
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
