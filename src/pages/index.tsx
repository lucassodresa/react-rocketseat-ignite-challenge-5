import { GetStaticProps } from 'next';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { Head } from 'next/document';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const treatPostInfo = (post): Post => {
  return {
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  };
};

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  // TODO
  const [postPaginationState, setPostPaginationState] =
    useState<PostPagination>({
      ...postsPagination,
    });

  const handleLoadMorePosts = async (): Promise<void> => {
    const response = await fetch(postPaginationState.next_page);
    const { next_page, results }: PostPagination = await response.json();

    const resultsTreated: Post[] = results.map(treatPostInfo);

    setPostPaginationState({
      next_page,
      results: [...postPaginationState.results, ...resultsTreated],
    });
  };

  return (
    <>
      {/* <Head>
        <title>Home | Spacetravelling</title>
      </Head> */}
      <div className={styles.container}>
        <ul className={styles.content}>
          {postPaginationState.results.map(post => (
            <li key={post.uid} className={styles.postCard}>
              <Link href={`/post/${post.uid}`}>
                <a>
                  <h2>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>

                  <footer>
                    <div className={styles.postInfo}>
                      <span>
                        <FiCalendar />
                      </span>
                      {format(
                        parseISO(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      ).toString()}
                    </div>
                    <div className={styles.postInfo}>
                      <span>
                        <FiUser />
                      </span>
                      {post.data.author}
                    </div>
                  </footer>
                </a>
              </Link>
            </li>
          ))}

          {postPaginationState.next_page && (
            <button
              type="button"
              onClick={handleLoadMorePosts}
              className={styles.loadMore}
            >
              Carregar mais posts
            </button>
          )}
        </ul>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const { next_page, results } = await prismic.getByType('posts', {
    pageSize: 1,
  });

  const resultsTreated: Post[] = results.map(treatPostInfo);

  return {
    props: {
      postsPagination: {
        results: resultsTreated,
        next_page,
      },
    },
  };
};
