import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import CreatePostPage from "./pages/CreatePostPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";
import { PostProvider } from "./context/PostContext";

function App() {
  return (
    <AuthProvider>
      <PostProvider>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/create-post' element={<CreatePostPage />} />
          </Route>
          <Route path='/admin' element={<AdminLoginPage />} />
        </Routes>
      </PostProvider>
    </AuthProvider>
  );
}

export default App;
