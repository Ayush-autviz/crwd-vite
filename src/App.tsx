import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from "sonner"
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import Interests from './pages/auth/Interests'
import Verify from './pages/auth/Verify'
import Search from './pages/Search'
import Search2 from './pages/Search2'
import Donation from './pages/Donation'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import ProfileById from './pages/ProfileById'
import ProfileStatistics from './pages/ProfileStatistics'
import Settings from './pages/Settings'
import SettingsEmail from './pages/settings/Email'
import SettingsPassword from './pages/settings/Password'
import SettingsPayments from './pages/settings/Payments'
import SettingsHelp from './pages/settings/Help'
import SettingsTerms from './pages/settings/Terms'
import SettingsPrivacy from './pages/settings/Privacy'
import SettingsAbout from './pages/settings/About'
import SettingsReport from './pages/settings/Report'
import TransactionHistory from './pages/TransactionHistory'
import Saved from './pages/Saved'
import YourCrwds from './pages/YourCrwds'
import ManageCrwd from './pages/ManageCrwd'
import CreateCrwd from './pages/CreateCrwd'
import CreatePost from './pages/CreatePost'
import CreateCause from './pages/CreateCause'
import FeedHungry from './pages/FeedHungry'
import Cause from './pages/Cause'
import CauseDetail from './pages/CauseDetail'
import GroupCrwd from './pages/GroupCrwd'
import Members from './pages/Members'
import Posts from './pages/Posts'
import PostById from './pages/PostById'
import Menu from './pages/Menu'
import MobileMenu from './pages/MobileMenu'
import DonationTest from './pages/DonationTest'

function App() {
  return (
    <Router>
      <div className="bg-background min-h-screen">
        <Routes>
          {/* Auth routes - no layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/interests" element={<Interests />} />
          <Route path="/verify" element={<Verify />} />

          {/* Main routes with layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/search2" element={<Search2 />} />
                <Route path="/donation" element={<Donation />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<ProfileById />} />
                <Route path="/profile/:id/statistics" element={<ProfileStatistics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/email" element={<SettingsEmail />} />
                <Route path="/settings/password" element={<SettingsPassword />} />
                <Route path="/settings/payments" element={<SettingsPayments />} />
                <Route path="/settings/help" element={<SettingsHelp />} />
                <Route path="/settings/terms" element={<SettingsTerms />} />
                <Route path="/settings/privacy" element={<SettingsPrivacy />} />
                <Route path="/settings/about" element={<SettingsAbout />} />
                <Route path="/settings/report" element={<SettingsReport />} />
                <Route path="/transaction-history" element={<TransactionHistory />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/your-crwds" element={<YourCrwds />} />
                <Route path="/your-crwds/:id" element={<ManageCrwd />} />
                <Route path="/create-crwd" element={<CreateCrwd />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/create-cause" element={<CreateCause />} />
                <Route path="/feed-hungry" element={<FeedHungry />} />
                <Route path="/cause" element={<Cause />} />
                <Route path="/cause-detail" element={<CauseDetail />} />
                <Route path="/groupcrwd" element={<GroupCrwd />} />
                <Route path="/members" element={<Members />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/posts/:id" element={<PostById />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/mobile-menu" element={<MobileMenu />} />
                <Route path="/donation-test" element={<DonationTest />} />
              </Routes>
            </Layout>
          } />
        </Routes>
        <Toaster richColors position="top-center" />
      </div>
    </Router>
  )
}

export default App