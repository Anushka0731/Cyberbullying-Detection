import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import Topbar from '../components/Topbar';
import PostCard from '../components/PostCard';

import { api } from '../services/api';

import './ProfilePage.css';


function timeAgo(dateStr) {

  const diff = Math.floor(
    (
      Date.now() -
      new Date(dateStr).getTime()
    ) / 1000
  );


  if (diff < 60) {
    return 'now';
  }


  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m`;
  }


  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h`;
  }


  return `${Math.floor(diff / 86400)}d`;
}


function toCard(p) {

  return {

    id: p._id,

    name:
      p.user?.name ??
      'Unknown',

    handle:
      p.user?.handle ??
      '',

    initials:
      p.user?.initials ??
      '?',

    time:
      timeAgo(p.createdAt),

    text:
      p.text,

    flagged:
      p.flagged,

    hits:
      p.flagged
        ? [
            {
              category:
                p.category,
            },
          ]
        : [],

    ups:
      p.ups ??
      p.likes ??
      0,

    upvoted: false,

  };
}


export default function ProfilePage() {

  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();


  const [user, setUser] =
    useState(null);

  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {

    if (
      !localStorage.getItem(
        'token'
      )
    ) {

      navigate('/');

      return;
    }


    async function loadProfile() {

      try {

        setLoading(true);
        setError('');


        const [
          userData,
          postData,
        ] = await Promise.all([

          api.getUser(id),

          api.getUserPosts(id),

        ]);


        setUser(userData);

        setPosts(
          postData.map(toCard)
        );


      } catch (err) {

        console.error(
          'PROFILE LOAD ERROR:',
          err
        );

        setError(
          err.message ||
          'Could not load profile.'
        );

      } finally {

        setLoading(false);

      }

    }


    loadProfile();

  }, [
    id,
    navigate,
  ]);


  if (loading) {

    return (

      <div className="profile-page">

        <Topbar />

        <div className="profile-loading">
          Loading profile...
        </div>

      </div>

    );

  }


  if (error) {

    return (

      <div className="profile-page">

        <Topbar />

        <div className="profile-error">

          <h2>
            Could not load profile
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={() =>
              navigate(
                '/dashboard'
              )
            }
          >
            Back to feed
          </button>

        </div>

      </div>

    );

  }


  return (

    <div className="profile-page">

      <Topbar />


      <main className="profile-container">


        {/* BACK BUTTON */}

        <button
          className="profile-back"
          onClick={() =>
            navigate(
              '/dashboard'
            )
          }
        >

          ← Back to feed

        </button>


        {/* PROFILE HEADER */}

        <section className="profile-header">

          <div className="profile-avatar">

            {user?.initials ||
              user?.name
                ?.split(' ')
                .map(
                  (word) =>
                    word[0]
                )
                .join('')
                .slice(0, 2)
                .toUpperCase()}

          </div>


          <div className="profile-info">

            <h1>
              {user?.name}
            </h1>

            <div className="profile-handle">

              @
              {user?.handle?.replace(
                /^@/,
                ''
              )}

            </div>


            {user?.bio && (

              <p className="profile-bio">
                {user.bio}
              </p>

            )}


            <div className="profile-stats">

              <span>

                <strong>
                  {posts.length}
                </strong>{' '}

                {posts.length === 1
                  ? 'post'
                  : 'posts'}

              </span>


              <span>

                <strong>
                  {user?.followers?.length ??
                    0}
                </strong>{' '}

                followers

              </span>


              <span>

                <strong>
                  {user?.following?.length ??
                    0}
                </strong>{' '}

                following

              </span>

            </div>

          </div>

        </section>


        {/* POSTS */}

        <section className="profile-posts">

          <div className="profile-posts-title">

            <h2>
              Posts
            </h2>

          </div>


          {posts.length === 0 ? (

            <div className="profile-empty">

              <h3>
                No posts yet
              </h3>

              <p>
                This user hasn't
                posted anything yet.
              </p>

            </div>

          ) : (

            posts.map((post) => (

              <PostCard
                key={post.id}
                post={post}
              />

            ))

          )}

        </section>

      </main>

    </div>

  );
}