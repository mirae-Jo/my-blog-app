import React, { useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Profile from "../components/Profile";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";

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
              <div
                className='relative h-64 bg-cover bg-center flex items-center justify-center rounded-t-xl overflow-hidden'
                style={
                  selectedPost.imageUrl
                    ? { backgroundImage: `url(${selectedPost.imageUrl})` }
                    : { backgroundColor: "#333" }
                }>
                <div className='absolute inset-0 bg-black opacity-30'></div>
                <h4 className='relative z-10 font-bold text-4xl text-white text-center px-4'>
                  {selectedPost.title}
                </h4>
              </div>
              <div className='px-6 pt-4 pb-10'>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className='text-4xl font-bold my-4' {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className='text-3xl font-bold my-3' {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className='text-2xl font-bold my-2' {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4 className='text-xl font-bold my-2' {...props} />
                    ),
                    h5: ({ node, ...props }) => (
                      <h5 className='text-lg font-bold my-2' {...props} />
                    ),
                    h6: ({ node, ...props }) => (
                      <h6 className='text-base font-bold my-2' {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className='border-l-4 border-gray-300 pl-4 italic my-4'
                        {...props}
                      />
                    ),
                    code: ({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }: React.HTMLAttributes<HTMLElement> & {
                      node?: any;
                      inline?: boolean;
                    }) => {
                      return !inline ? (
                        <SyntaxHighlighter
                          style={coy as any}
                          language='javascript'
                          PreTag='div'
                          {...props}>
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}>
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
