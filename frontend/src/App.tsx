import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TemplateGalleryPage } from './pages/TemplateGalleryPage';
import { DatasetsPage } from './pages/DatasetsPage';
import { EditorPage } from './pages/EditorPage';
import { TemplateCreatorPage } from './pages/TemplateCreatorPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/templates" element={<TemplateGalleryPage />} />
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/create/:templateId" element={<TemplateCreatorPage />} />
          <Route path="/editor/:templateId" element={<EditorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
