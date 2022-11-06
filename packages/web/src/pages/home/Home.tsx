import React from 'react';

import { getPosts } from 'src/api/blog';
import { useSSR } from 'src/providers/SSRProvider';

import PostItem from 'src/components/PostItem';
import Ref from 'src/components/Ref';
import Divider from 'src/components/ui/Divider';
import { List } from 'src/components/ui/List';

const Home = () => {
  const empty: { _id: string }[] = new Array(2).fill({ _id: '?' });
  const { data: posts, loaded } = useSSR(
    getPosts({ page: 1, limit: 2, search: '', preview: true }),
    {
      chainSuccess: (data) => data.posts,
    }
  );

  return (
    <div className="flex flex-col gap-7">
      <span>
        <h2 className="text-xl font-bold">This is home</h2>
      </span>
      <span>
        I am someone that likes to dabble and try things. And sometimes it just
        goes unexpectedly well.
      </span>
      <span>
        As I finally came around to the idea of starting{' '}
        <Ref text="blog" href="/blog" /> posts about stuff I like to work on I
        am designating this space for my hobby projects and other interesting
        titbits I encounter when working.
      </span>
      <span>
        I have always enjoyed learning (and educating others) with all the weird
        little kinks and intricacies programming throws at you all the time.
        Maybe I can shed some light on these weirdnesses or maybe you are just
        here to have a snoop around, don&apos;t let me stop you.
      </span>
      <span>
        <Divider />
      </span>
      <span>
        <h3 className="text-xl font-bold">Me (briefly)</h3>
      </span>
      <span>
        I&apos;m a software engineer, orginally from Germany and now living and
        working in the UK. As of right now I am employed at
        <Ref text="Simply Do Ideas" href="https://simplydo.co.uk" />.
      </span>
      <span>
        I am currently working on my research towards a PhD at{' '}
        <Ref text="Cardiff University" href="https://cardiff.ac.uk" /> (started
        in 2019). I have always been fascinated with the psychology surrounding
        the use of technology and being able to research Human Computer
        Interaction to this extent is a great experience.
      </span>
      <span>
        <Divider />
      </span>
      <span>
        <h3 className="text-xl font-bold">Recent posts</h3>
        <div className="flex flex-col">
          <List>
            {loaded
              ? posts.map((p) => <PostItem key={p._id} post={p} />)
              : empty.map((p, i) => <PostItem key={i} />)}
          </List>
        </div>
      </span>
    </div>
  );
};

export default Home;
