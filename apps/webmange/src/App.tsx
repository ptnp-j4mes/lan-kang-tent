import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { Spinner } from "@/components/ui";
import { LoginPage } from "@/pages/login";
import { DashboardPage } from "@/pages/dashboard";
import { CampsitesPage } from "@/pages/admin/campsites";
import { ReviewsPage } from "@/pages/admin/reviews";
import { ClaimsPage } from "@/pages/admin/claims";
import { BannersPage } from "@/pages/admin/banners";
import { ArticlesPage } from "@/pages/admin/articles";
import { UsersPage } from "@/pages/admin/users";
import { SettingsPage } from "@/pages/admin/settings";

function Shell() {
  const { me } = useAuth();

  if (me === undefined)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  if (me === null) return <LoginPage />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="campsites" element={<CampsitesPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="claims" element={<ClaimsPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}
