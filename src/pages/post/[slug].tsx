import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Image from 'next/image';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  if (isFallback) return <div>Carregando...</div>;

  const minutesToRead = Math.ceil(
    post.data.content.reduce((acc, { heading, body }) => {
      const wordCount = `${heading} ${RichText.asText(body)}`
        .split(' ')
        .filter(word => word !== '').length;

      return acc + wordCount;

      // const text = `${heading} ${RichText.asText(body)}`;
      // console.log(text);
    }, 0) / 200
  );

  const allHtmlPostContent = post.data.content;

  console.log(allHtmlPostContent);

  return (
    <>
      <div
        className={styles.bannerContainer}
        style={{ backgroundImage: `url(${post.data.banner.url})` }}
      />
      {/* <Image src={post.data.banner.url} alt="Banner" layout="fill" /> */}
      {/* </div> */}

      <div className={styles.container}>
        <div className={styles.content}>
          <h1>{post.data.title}</h1>
          <footer>
            <div className={styles.postInfo}>
              <span>
                <FiCalendar />
              </span>
              {format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              }).toString()}
            </div>
            <div className={styles.postInfo}>
              <span>
                <FiUser />
              </span>
              {post.data.author}
            </div>
            <div className={styles.postInfo}>
              <span>
                <FiClock />
              </span>
              {minutesToRead} min
            </div>
          </footer>
          {post.data.content.map(({ heading, body }) => {
            return (
              <div key={heading} className={styles.heading_content}>
                <h3>{heading}</h3>
                {body.map(({ text }, index) => (
                  <p key={index}>{text}</p>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    lang: 'pt-BR',
  });

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const post = await prismic.getByUID('posts', String(slug));

  const postTreated = {
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      banner: { url: post.data.banner.url },
      author: post.data.author,
      content: post.data.content,
    },
  };

  // TODO

  return { props: { post: postTreated } };
};
