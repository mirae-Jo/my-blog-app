export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { title, content, create_at, imageUrl } = req.body;
  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepoOwner = 'mirae-Jo'; // GitHub 사용자 이름
  const githubRepoName = 'my-blog-posts'; // 생성할 GitHub 레포지토리 이름

  console.log('Received request for GitHub post creation.', { title, create_at });

  if (!githubToken) {
    console.error('GitHub token not configured.');
    return res.status(500).json({ error: 'GitHub token not configured.' });
  }
  if (!title || !content || !create_at) {
    console.error('Missing required post data.', { title, content: content ? 'present' : 'missing', create_at });
    return res.status(400).json({ error: 'Missing required post data.' });
  }

  try {
    const date = new Date(create_at);
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `${formattedDate}-${title.replace(/\s/g, '-')}.md`;
    const filePath = `posts/${fileName}`;

    const markdownContent = `---
title: "${title}"
date: "${create_at}"
${imageUrl ? `image: "${imageUrl}"` : ''}
---

${content}
`;

    console.log('Attempting to commit file to GitHub:', { filePath, fileName });

    // GitHub API를 사용하여 파일 생성 또는 업데이트
    const response = await fetch(
      `https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${githubToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Vercel-Serverless-Function',
        },
        body: JSON.stringify({
          message: `Add new post: ${title}`,
          content: Buffer.from(markdownContent).toString('base64'),
          branch: 'main', // 또는 'master' 브랜치
        }),
      }
    );

    console.log('GitHub API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API Error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Failed to commit to GitHub', details: errorText });
    }

    console.log('Post successfully committed to GitHub.');
    res.status(200).json({ message: 'Post successfully committed to GitHub.' });
  } catch (error) {
    console.error('Serverless function caught an error:', error);
    res.status(500).json({ error: 'Internal server error.', details: error instanceof Error ? error.message : String(error) });
  }
}