import React, { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, Link, Outlet, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Profile from "./components/Profile";

import CreatePostPage from "./pages/CreatePostPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import { supabase } from "./lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  create_at: Date;
}

const HomePage = ({
  isAuthenticated,
  posts,
  selectedPost,
  setSelectedPost,
}: {
  isAuthenticated: boolean;
  posts: Post[];
  selectedPost: Post | null;
  setSelectedPost: (post: Post) => void;
}) => {
  const otherPosts = posts.filter((post) =>
    selectedPost ? post.id !== selectedPost.id : true
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { left, width } = container.getBoundingClientRect();
    const mouseX = e.clientX - left;

    const threshold = 0.2; // 20% from each edge
    const scrollAmount = 200; // Scroll by roughly one card width

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (mouseX < width * threshold) {
      // Mouse is on the left edge
      scrollTimeoutRef.current = window.setTimeout(() => {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }, 100); // Delay for smoother feel
    } else if (mouseX > width * (1 - threshold)) {
      // Mouse is on the right edge
      scrollTimeoutRef.current = window.setTimeout(() => {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }, 100); // Delay for smoother feel
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className='font-regular bg-gray-50 min-h-screen pb-10'>
      <Header isAuthenticated={isAuthenticated} />
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <Profile isAuthenticated={isAuthenticated} />
      </div>
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <section className='mt-18'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-[1.6rem] font-bold text-gray-700'>My Posts</h3>
            {isAuthenticated && (
              <Link
                to='/create-post'
                className='ml-4 border border-blue-500 text-blue-500 px-3 py-1 rounded-full font-semibold text-sm shadow-md hover:bg-blue-500 hover:text-white transition-colors duration-300'>
                + New Post
              </Link>
            )}
          </div>
          {selectedPost && (
            <div className='bg-white rounded-xl shadow-lg mb-16'>
              <div className='px-6 pt-6'>
                <h4 className='font-bold text-4xl text-gray-900 mb-4'>
                  {selectedPost.title}
                </h4>
              </div>
              {selectedPost.imageUrl && (
                <div className='px-6 py-6'>
                  <img
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    className='w-full h-auto max-h-96 object-contain object-left'
                  />
                </div>
              )}
              <div className='px-6 pt-4 pb-10'>
                <p className='text-gray-700 text-base leading-relaxed whitespace-pre-wrap'>
                  {selectedPost.content}
                </p>
              </div>
            </div>
          )}

          <div
            ref={scrollContainerRef}
            className='flex overflow-x-auto space-x-6 pb-4 scroll-smooth scroll-container snap-x snap-mandatory'
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}>
            {otherPosts.length === 0 && !isAuthenticated && !selectedPost && (
              <p className='text-gray-600 text-lg flex-shrink-0'>
                No posts yet. Check back later!
              </p>
            )}
            {otherPosts.map((post) => (
              <div
                key={post.id}
                className='flex-shrink-0 w-64 bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 cursor-pointer snap-start'
                onClick={() => setSelectedPost(post)}>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className='w-full h-48 object-cover'
                  />
                )}
                <div className='p-6'>
                  <h4 className='font-bold text-xl text-gray-900 mb-2'>
                    {post.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("post")
          .select("id, title, content, img_url, create_at")
          .order("create_at", { ascending: false });

        if (error) {
          console.error("Error fetching posts:", error);
          return;
        }

        if (data) {
          const fetchedPosts: Post[] = data.map((post) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            imageUrl: post.img_url || undefined,
            create_at: post.create_at,
          }));
          setPosts(fetchedPosts);
          if (fetchedPosts.length > 0 && selectedPost === null) {
            setSelectedPost(fetchedPosts[0]);
          }
        }
      } catch (networkError) {
        console.error("Network error fetching posts:", networkError);
      }
    };

    if (posts.length === 0) {
      // posts가 비어있을 때만 fetchPosts 호출
      fetchPosts();
    }
  }, [posts, selectedPost]); // selectedPost는 setSelectedPost에 의해 변경되므로 의존성 배열에 유지

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsAuthenticated(!!newSession);
    });

    return () => subscription.unsubscribe();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const handleAddPost = async (
    title: string,
    content: string,
    imageUrl: string
  ) => {
    const newId = uuidv4(); // Generate a new UUID for the post
    const { data, error } = await supabase
      .from("post")
      .insert({
        id: newId,
        title,
        content,
        img_url: imageUrl || null,
      })
      .select();

    if (error) {
      console.error("Error adding post:", error);
      alert("게시글 추가에 실패했습니다: " + error.message);
      return;
    }

    if (data && data.length > 0) {
      const newPost: Post = {
        id: data[0].id,
        title: data[0].title,
        content: data[0].content,
        imageUrl: data[0].img_url || undefined,
        create_at: data[0].create_at,
      };
      setPosts((prevPosts) => {
        const updatedPosts = [...prevPosts, newPost];
        setSelectedPost(newPost); // Set the newly added post as selected
        return updatedPosts;
      });
    }
  };

  return (
    <Routes>
      <Route
        path='/'
        element={
          <HomePage
            isAuthenticated={isAuthenticated}
            posts={posts}
            selectedPost={selectedPost}
            setSelectedPost={setSelectedPost}
          />
        }
      />
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route
          path='/create-post'
          element={<CreatePostPage onAddPost={handleAddPost} />}
        />
      </Route>
      <Route path='/admin' element={<AdminLoginPage />} />
    </Routes>
  );
}

const ProtectedRoute = ({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children?: React.ReactNode;
}) => {
  if (!isAuthenticated) {
    return <Navigate to='/admin' replace />;
  }
  return children ? children : <Outlet />;
};

export default App;
