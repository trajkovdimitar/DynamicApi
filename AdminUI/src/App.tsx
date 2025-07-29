import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ModelsPage from './pages/ModelsPage';
import ModelEditorPage from './pages/ModelEditorPage';
import DataBrowser from './pages/DataBrowser';
import RecordEditor from './pages/RecordEditor';
import RulesPage from './pages/RulesPage';
import WorkflowsPage from './pages/WorkflowsPage';
import UsersPage from './pages/UsersPage';
import { Layout } from './layout/Layout';

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/models" replace />} />
                    <Route path="/models" element={<ModelsPage />} />
                    <Route path="/models/:name" element={<ModelEditorPage />} />
                    <Route path="/data/:name" element={<DataBrowser />} />
                    <Route path="/data/:name/:id" element={<RecordEditor />} />
                    <Route path="/rules" element={<RulesPage />} />
                    <Route path="/workflows" element={<WorkflowsPage />} />
                    <Route path="/users" element={<UsersPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}