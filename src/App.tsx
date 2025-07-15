import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Profile from './components/Profile';
import Controls from './components/Controls';
import CreatePostPage from './pages/CreatePostPage';

interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  const handleAddPost = (title: string, content: string, imageUrl: string) => {
    const newPost: Post = {
      id: posts.length > 0 ? Math.max(...posts.map(post => post.id)) + 1 : 1,
      title,
      content,
      imageUrl: imageUrl || 'https://via.placeholder.com/400x250', // Default image if none provided
    };
    setPosts([...posts, newPost]);
  };

  const HomePage = () => (
    <div className="font-sans bg-gray-50 min-h-screen pb-10">
      <Controls isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Header isAuthenticated={isAuthenticated} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Profile isAuthenticated={isAuthenticated} />
        <section className="mt-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">My Posts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length === 0 && !isAuthenticated && (
              <p className="text-gray-600 text-lg col-span-full text-center">No posts yet. Check back later!</p>
            )}
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
                <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover"/>
                <div className="p-6">
                  <h4 className="font-bold text-xl text-gray-900 mb-2">{post.title}</h4>
                </div>
              </div>
            ))}
            {isAuthenticated && (
              <div className="bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-full min-h-[250px] p-6">
                <p className="text-gray-500 text-lg mb-4">Ready to share your thoughts?</p>
                <Link 
                  to="/create-post"
                  className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-md hover:bg-blue-700 transition-colors duration-300"
                >
                  + Add New Post
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create-post" element={<CreatePostPage onAddPost={handleAddPost} />} />
    </Routes>
  );
}

export default App;