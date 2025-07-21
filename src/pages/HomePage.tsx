import React, { useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Profile from "../components/Profile";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { posts, selectedPost, setSelectedPost } = usePosts();

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
      <Header />
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <Profile />
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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedPost.content}
                </ReactMarkdown>
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

export default HomePage;
