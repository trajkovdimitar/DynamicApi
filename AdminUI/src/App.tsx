import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ModelsPage from './pages/ModelsPage';
import ModelEditorPage from './pages/ModelEditorPage';
import DataBrowser from './pages/DataBrowser';
import RecordEditor from './pages/RecordEditor';
import RulesPage from './pages/RulesPage';
import WorkflowsPage from './pages/WorkflowsPage';
import { Layout } from './layout/Layout';

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/models" element={<ModelsPage />} />
                    <Route path="/models/:name" element={<ModelEditorPage />} />
                    <Route path="/data/:name" element={<DataBrowser />} />
                    <Route path="/data/:name/:id" element={<RecordEditor />} />
                    <Route path="/rules" element={<RulesPage />} />
                    <Route path="/workflows" element={<WorkflowsPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
