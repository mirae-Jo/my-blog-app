import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkBreaks from "remark-breaks";
import type { Post } from "../context/PostContext";

interface SelectedPostProps {
  post: Post;
}

const SelectedPost: React.FC<SelectedPostProps> = ({ post }) => {
  return (
    <div className='bg-white rounded-xl shadow-lg mb-16'>
      <div
        className='relative h-64 bg-cover bg-center flex items-center justify-center rounded-t-xl overflow-hidden'
        style={
          post.imageUrl
            ? { backgroundImage: `url(${post.imageUrl})` }
            : { backgroundColor: "#333" }
        }>
        <div className='absolute inset-0 bg-black opacity-30'></div>
        <h4 className='relative z-10 font-bold text-4xl text-white text-center px-4'>
          {post.title}
        </h4>
      </div>
      <div className='p-10'>
        <ReactMarkdown
          remarkPlugins={[remarkBreaks]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className='text-4xl font-bold my-4' {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className='text-3xl font-bold my-4' {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className='text-2xl font-bold my-3' {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className='text-xl font-bold my-3' {...props} />
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
            p: ({ node, ...props }) => <p className='mb-4.5' {...props} />,
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
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default SelectedPost;
