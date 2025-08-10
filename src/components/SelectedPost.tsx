import React from "react";
import ReactMarkdown from "react-markdown";

import remarkBreaks from "remark-breaks";
import type { Post } from "../context/PostContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";

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
        <div className='absolute inset-0 bg-black opacity-5'></div>
        <div className='relative z-10 text-white text-center px-4'>
          <h4 className='font-bold text-4xl text-shadow-lg'>{post.title}</h4>
          <p className='text-sm mt-2'>
            {new Date(post.create_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            {new Date(post.create_at).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
      </div>
      <div className='p-10 prose max-w-none'>
        <ReactMarkdown
          remarkPlugins={[remarkBreaks]}
          components={{
            pre: (props) => <pre className='not-prose' {...props} />,
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
