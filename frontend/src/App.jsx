import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleRoute from './components/RoleRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import PartnerLogin from './pages/PartnerLogin.jsx';
import Register from './pages/Register.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import ThemeSettings from './pages/settings/ThemeSettings.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import PartnerLayout from './layouts/PartnerLayout.jsx';
import AdminGifts from './pages/admin/GiftsManager.jsx';
import PartnerGifts from './pages/partner/Gifts.jsx';
import AdminMusic from './pages/admin/MusicManager.jsx';
import PartnerMusic from './pages/partner/Music.jsx';
import AdminMovies from './pages/admin/MoviesManager.jsx';
import PartnerMovies from './pages/partner/Movies.jsx';
import AdminFoods from './pages/admin/FoodManager.jsx';
import PartnerFoods from './pages/partner/Foods.jsx';
import AdminMoods from './pages/admin/MoodAnalytics.jsx';
import PartnerMood from './pages/partner/Mood.jsx';
import AdminBucket from './pages/admin/BucketManager.jsx';
import PartnerBucket from './pages/partner/BucketList.jsx';
import Calendar from './pages/shared/Calendar.jsx';
import AdminGalleryManager from './pages/admin/GalleryManager.jsx';
import AdminLettersManager from './pages/admin/LettersManager.jsx';
import AdminTimelineManager from './pages/admin/TimelineManager.jsx';
import PartnerGallery from './pages/partner/Gallery.jsx';
import PartnerLetters from './pages/partner/Letters.jsx';
import PartnerTimeline from './pages/partner/Timeline.jsx';
import MemoryDetails from './pages/shared/MemoryDetails.jsx';
import LetterDetails from './pages/shared/LetterDetails.jsx';
import SearchPage from './pages/shared/Search.jsx';
import CoupleProfile from './pages/shared/CoupleProfile.jsx';
import PermissionPage from './pages/admin/Permissions.jsx';
import NotificationsPage from './pages/shared/Notifications.jsx';
import GeneralSettings from './pages/settings/General.jsx';
import SecuritySettings from './pages/settings/Security.jsx';
import PrivacySettings from './pages/settings/Privacy.jsx';
import StorageSettings from './pages/settings/Storage.jsx';
import NotificationSettings from './pages/settings/Notifications.jsx';
import ActivityLogPage from './pages/admin/ActivityLog.jsx';
import ExportDataPage from './pages/admin/ExportData.jsx';
import AnalyticsPage from './pages/admin/Analytics.jsx';
import EditMemory from "./pages/admin/EditMemory";
import Chat from "./pages/chat/Chat";
import Security from "./pages/settings/Security.jsx";

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/partner/dashboard'} replace />;
}

function SharedApp({ children }) {
  return <ProtectedRoute><AppShell>{children}</AppShell></ProtectedRoute>;
}

function RoleCollection({ admin, partner }) {
  const { role } = useAuth();
  return role === 'ADMIN' ? admin : partner;
}

export default function App() {
  return (

    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/partner-login" element={<PartnerLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/first-login" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><RoleRoute role="ADMIN"><AdminLayout><AdminDashboard /></AdminLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/gallery" element={<ProtectedRoute><RoleRoute role="ADMIN"><AdminLayout><AdminGalleryManager /></AdminLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/letters" element={<ProtectedRoute><RoleRoute role="ADMIN"><AdminLayout><AdminLettersManager /></AdminLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/timeline" element={<ProtectedRoute><RoleRoute role="ADMIN"><AdminLayout><AdminTimelineManager /></AdminLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/permissions" element={<ProtectedRoute><RoleRoute role="ADMIN"><AdminLayout><PermissionPage /></AdminLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/activity" element={<ProtectedRoute><RoleRoute role="ADMIN"><AdminLayout><ActivityLogPage /></AdminLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/export" element={<ProtectedRoute><RoleRoute role="ADMIN"><AdminLayout><ExportDataPage /></AdminLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute><RoleRoute role="ADMIN"><AdminLayout><AnalyticsPage /></AdminLayout></RoleRoute></ProtectedRoute>} />
      <Route path="/partner/dashboard" element={<ProtectedRoute><RoleRoute role="PARTNER"><PartnerLayout><Dashboard /></PartnerLayout></RoleRoute></ProtectedRoute>} />
      <Route element={<SharedApp />}><Route path="/gallery" element={<RoleCollection admin={<AdminGalleryManager />} partner={<PartnerGallery />} />} /><Route path="/memories/:id" element={<MemoryDetails />} /><Route path="/foods" element={<RoleCollection admin={<AdminFoods />} partner={<PartnerFoods />} />} /><Route path="/movies" element={<RoleCollection admin={<AdminMovies />} partner={<PartnerMovies />} />} /><Route path="/music" element={<RoleCollection admin={<AdminMusic />} partner={<PartnerMusic />} />} /><Route path="/letters" element={<RoleCollection admin={<AdminLettersManager />} partner={<PartnerLetters />} />} /><Route path="/letters/:id" element={<LetterDetails />} /><Route path="/gifts" element={<RoleCollection admin={<AdminGifts />} partner={<PartnerGifts />} />} /><Route path="/timeline" element={<RoleCollection admin={<AdminTimelineManager />} partner={<PartnerTimeline />} />} /><Route path="/moods" element={<RoleCollection admin={<AdminMoods />} partner={<PartnerMood />} />} /><Route path="/bucket-list" element={<RoleCollection admin={<AdminBucket />} partner={<PartnerBucket />} />} /><Route path="/calendar" element={<Calendar />} /><Route path="/search" element={<SearchPage />} /><Route path="/couple-profile" element={<CoupleProfile />} /><Route path="/notifications" element={<NotificationsPage />} /><Route path="/profile" element={<Profile />} /><Route path="/settings" element={<Settings />} /><Route path="/settings/general" element={<GeneralSettings />} /><Route path="/settings/theme" element={<ThemeSettings />} /><Route path="/settings/security" element={<SecuritySettings />} /><Route path="/settings/privacy" element={<PrivacySettings />} /><Route path="/settings/storage" element={<StorageSettings />} /><Route path="/settings/notifications" element={<NotificationSettings />} /></Route>
      <Route path="/forbidden" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
      <Route
        path="/memories/:id/edit"
        element={<EditMemory />}
      />
      <Route path="/chat" element={<Chat />} />
      <Route path="/settings/security" element={<Security />} />
    </Routes>

  );
}
