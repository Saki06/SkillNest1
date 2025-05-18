import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import GoogleCallback from './components/GoogleCallback';
import ProfileLayout from './components/profile/ProfileLayout';
import AboutSection from './components/profile/AboutSection';
import SkillsSection from './components/profile/SkillsSection';
import DocumentsSection from './components/profile/DocumentsSection';
import ShowcasesSection from './components/profile/ShowcasesSection';
import RecommendationsSection from './components/profile/RecommendationsSection';
import PostsSection from './components/profile/PostsSection';
import SearchPage from './pages/SearchPage';
import Index from './pages/Index';
import PublicProfilePage from "./components/profile/PublicProfilePage"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        
        <Route path="/profile" element={<ProfileLayout />}>
          <Route path="about" element={<AboutSection />} />
          <Route path="skills" element={<SkillsSection />} />
          <Route path="documents" element={<DocumentsSection />} />
          <Route path="showcases" element={<ShowcasesSection />} />
          <Route path="recommendations" element={<RecommendationsSection />} />
          <Route path="posts" element={<PostsSection />} />
        </Route>
        <Route path="/profile/:userId" element={<PublicProfilePage />} />
        <Route path="/user" element={<Index />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
      <ToastContainer />
    </>
  );
}
export default App;