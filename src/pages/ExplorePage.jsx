import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';

import { api } from '../services/api';

import './ExplorePage.css';


function timeAgo(dateStr) {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );

  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

  return `${Math.floor(diff / 86400)}d`;
}


function toCard(post) {
  return {
    id: post._id,

    name: post.user?.name ?? 'Unknown',

    handle: post.user?.handle ?? '',

    initials:
      post.user?.initials ??
      post.user?.name
        ?.split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ??
      '?',

    time: timeAgo(post.createdAt),

    text: post.text,

    flagged: post.flagged === true,

    hits:
      post.flagged === true
        ? [{ category: post.category }]
        : [],

    ups: post.ups ?? post.likes ?? 0,

    upvoted: false,
  };
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {

    if (!localStorage.getItem('token')) {
      navigate('/');
      return;
    }
    async function loadExplore() {

      try {

        setLoading(true);
        setError('');
        const data = await api.getPosts();
        setPosts(data.map(toCard));
      } catch (err) {
        console.error(
          'EXPLORE LOAD ERROR:',
          err
        );

        setError(
          err.message ||
          'Could not load Explore.'
        );

      } finally {
        setLoading(false);

      }
    }

    loadExplore();
  }, [navigate]);

  return (
    <div className="explore-page">
      <Topbar />
      <div className="explore-layout">
        <Sidebar
        onNewPost={() => navigate('/dashboard')}
        />
        <main className="explore-main">
          <div className="explore-header">
            <h1>
              Explore
            </h1>
            <p>
              See what's new today...
              Discover posts from everyone on Unsaid.
            </p>
          </div>
          {loading && (
            <div className="explore-message">
              Loading posts...
            </div>
          )}

          {!loading && error && (
            <div className="explore-message explore-error">

              <h3>
                Could not load Explore
              </h3>

              <p>
                {error}
              </p>

            </div>
          )}

          {!loading &&
            !error &&
            posts.length === 0 && (

              <div className="explore-empty">
                <h2>
                  Nothing new yet
                </h2>
                <p>
                  Posts from the community
                  will appear here.
                </p>
              </div>

            )}

          {!loading &&
            !error &&
            posts.length > 0 && (

              <div className="explore-feed">

                {posts.map((post) => (

                  <PostCard
                    key={post.id}
                    post={post}
                  />

                ))}
              </div>
            )}
        </main>
      </div>
    </div>
  );
}