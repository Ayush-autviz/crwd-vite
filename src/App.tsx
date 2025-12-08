import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect } from "react";
import Layout from "./components/Layout";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { useAuthStore } from "./stores/store";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Interests from "./pages/auth/Interests";
import Verify from "./pages/auth/Verify";
import Search from "./pages/Search";
import Search2 from "./pages/Search2";
import Donation from "./pages/Donation";
import ManageDonationBox from "./pages/ManageDonationBox";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import ProfileById from "./pages/ProfileById";
import ProfileStatistics from "./pages/ProfileStatistics";
import Settings from "./pages/Settings";
import NewSettings from "./pages/NewSettings";
import SettingsEmail from "./pages/settings/Email";
import SettingsPassword from "./pages/settings/Password";
import SettingsPayments from "./pages/settings/Payments";
import SettingsHelp from "./pages/settings/Help";
import SettingsTerms from "./pages/settings/Terms";
import SettingsPrivacy from "./pages/settings/Privacy";
import SettingsAbout from "./pages/settings/About";
import SettingsReport from "./pages/settings/Report";
import TransactionHistory from "./pages/TransactionHistory";
import Saved from "./pages/Saved";
import YourCrwds from "./pages/YourCrwds";
import ManageCrwd from "./pages/ManageCrwd";
import CreateCrwd from "./pages/CreateCrwd";
import CreatePost from "./pages/CreatePost";
import CreateCause from "./pages/CreateCause";
import FeedHungry from "./pages/FeedHungry";
import Cause from "./pages/Cause";
import CauseDetail from "./pages/CauseDetail";
import CauseById from "./pages/CauseById";
import GroupCrwd from "./pages/GroupCrwd";
import GroupCrwdById from "./pages/GroupCrwdById";
import NewGroupCrwd from "./pages/NewGroupCrwd";
import NewCause from "./pages/NewCause";
import EditCollective from "./pages/EditCollective";
import Members from "./pages/Members";
import Posts from "./pages/Posts";
import PostById from "./pages/PostById";
import Menu from "./pages/Menu";
import MobileMenu from "./pages/MobileMenu";
import DonationTest from "./pages/DonationTest";
import UserProfile from "./pages/UserProfile";
import OnBoard from "./pages/onboarding/OnBoard";
import ClaimProfile from "./pages/onboarding/ClaimProfile";
import NonProfitInterests from "./pages/onboarding/NonProfitInterests";
import CompleteOnboard from "./pages/onboarding/CompleteOnboard";
import GoogleCallback from "./pages/auth/GoogleCallback";
import Circles from "./pages/Circles";
import Articles from "./pages/Articles";
import PaymentResult from "./pages/PaymentResult";
import Waitlist from "./pages/Waitlist";
import NewHome from "./pages/NewHome";
import NewOnboard from "./pages/newOnboarding/NewOnboard";
import NewClaimProfile from "./pages/newOnboarding/NewClaimProfile";
import NewNonProfitInterests from "./pages/newOnboarding/NewNonProfitInterests";
import NewCompleteOnboard from "./pages/newOnboarding/NewCompleteOnboard";

// ScrollToTop component that works for all pages
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });

      // Also scroll document elements
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    // Execute immediately
    scrollToTop();

    // Execute after a small delay to ensure DOM is ready
    const timeoutId = setTimeout(scrollToTop, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]); // Run every time the pathname changes

  return null;
}

// Component to handle auth route navigation
function AuthRouteHandler() {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  // If user has a token, navigate to home
  useEffect(() => {
    if (token?.access_token) {
      navigate("/");
    }
  }, []);

  return null;
}

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <ScrollToTop />
      <FavoritesProvider>
        <div className="bg-background min-h-screen">
          {/* <AuthRouteHandler /> */}
          <Routes>
            {/* Auth routes - only render if no token */}
            {!token?.access_token && (
              <>
                <Route path="/login" element={<Login />} />
                {/* <Route path="/signup" element={<Signup />} /> */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/interests" element={<Interests />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                {/* <Route path="/onboarding" element={<OnBoard />} />s */}
                <Route path="/onboarding" element={<NewOnboard />} />
                {/* <Route path="/complete-onboard" element={<CompleteOnboard />} /> */}
                {/* <Route path="/claim-profile" element={<ClaimProfile />} /> */}
                <Route path="/claim-profile" element={<NewClaimProfile />} /> New Claim Profile
                {/* <Route
                  path="/non-profit-interests"
                  element={<NonProfitInterests />}
                /> */}
              </>
            )}

            {/* Main routes with layout */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    {/* <Route path="/" element={<Home />} /> */}
                    <Route path="/" element={<NewHome />} />
                    <Route path="/waitlist" element={<Waitlist />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/search2" element={<Search2 />} />
                    <Route path="/donation" element={<Donation />} />
                    <Route path="/donation/manage" element={<ManageDonationBox />} />
                    <Route path="/notifications" element={<Notifications />} />
                    {/* <Route
                  path="/non-profit-interests"
                  element={<NonProfitInterests />}
                /> */}
                    <Route path="/non-profit-interests" element={<NewNonProfitInterests />} />
                    <Route path="/profile" element={<Profile />} />
                    {/* <Route path="/profile/:id" element={<ProfileById />} /> */}
                    <Route path="/profile/edit" element={<ProfileById />} />
                    <Route
                      path="/profile/statistics"
                      element={<ProfileStatistics />}
                    />
                    <Route path="/settings" element={<NewSettings />} />
                    <Route path="/settings/email" element={<SettingsEmail />} />
                    <Route
                      path="/settings/password"
                      element={<SettingsPassword />}
                    />
                    <Route
                      path="/settings/payments"
                      element={<SettingsPayments />}
                    />
                    <Route path="/settings/help" element={<SettingsHelp />} />
                    <Route path="/settings/terms" element={<SettingsTerms />} />
                    <Route
                      path="/settings/privacy"
                      element={<SettingsPrivacy />}
                    />
                    <Route path="/settings/about" element={<SettingsAbout />} />
                    <Route
                      path="/settings/report"
                      element={<SettingsReport />}
                    />
                    <Route
                      path="/transaction-history"
                      element={<TransactionHistory />}
                    />
                    <Route path="/payment/result" element={<PaymentResult />} />
                    <Route path="/saved" element={<Saved />} />
                    {/* <Route path="/your-crwds" element={<YourCrwds />} /> */}
                    {/* <Route path="/your-crwds/:id" element={<ManageCrwd />} /> */}
                    <Route path="/create-crwd" element={<CreateCrwd />} />
                    <Route path="/create-post" element={<CreatePost />} />
                    {/* <Route path="/create-cause" element={<CreateCause />} /> */}
                    {/* <Route path="/feed-hungry" element={<FeedHungry />} /> */}
                    {/* <Route path="/cause/:causeId" element={<Cause />} /> */}
                    <Route path="/cause/:causeId" element={<NewCause />} />
                    {/* <Route path="/cause-detail" element={<CauseDetail />} /> */}
                    {/* <Route path="/cause/:id" element={<CauseById />} /> */}
                    {/* <Route path="/groupcrwd/:crwdId" element={<GroupCrwd />} /> */}
                    <Route path="/groupcrwd/:crwdId" element={<NewGroupCrwd />} />
                    <Route path="/edit-collective/:crwdId" element={<EditCollective />} />
                    {/* <Route path="/groupcrwd/:id" element={<GroupCrwdById />} /> */}
                    <Route path="/members" element={<Members />} />
                    <Route path="/posts" element={<Posts />} />
                    <Route path="/post/:id" element={<PostById />} />
                    {/* <Route path="/menu" element={<Menu />} /> */}
                    {/* <Route path="/mobile-menu" element={<MobileMenu />} /> */}
                    <Route path="/donation-test" element={<DonationTest />} />
                    <Route path="/user-profile/:userId" element={<UserProfile />} />
                    <Route path="/circles" element={<Circles />} />
                    <Route path="/articles" element={<Articles />} />
                    {/* <Route path="/complete-onboard" element={<CompleteOnboard />} /> */}
                    <Route path="/complete-onboard" element={<NewCompleteOnboard />} />
                    
                  </Routes>
                </Layout>
              }
            />
          </Routes>
          <Toaster richColors position="top-center" />
        </div>
      </FavoritesProvider>
    </Router>
  );
}

export default App;
