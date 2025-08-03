import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

import { PostProvider } from "./context/PostContext";

const CreatePostPage = lazy(() => import("./pages/CreatePostPage"));

function App() {
  return (
    <PostProvider>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path='/create-post'
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <CreatePostPage />
              </Suspense>
            }
          />
        </Route>
        <Route path='/admin' element={<AdminLoginPage />} />
      </Routes>
    </PostProvider>
  );
}

export default App;
