import React from 'react'

import { Divider, List } from '@mui/material'

import { useSSR } from 'app/providers/SSRProvider'
import { withRequest } from 'app/providers/RequestProvider'
import { getPosts } from 'app/api/blog'

import { Column } from 'app/components/Flex'
import { H2, H4 } from 'app/components/Text'
import Ref from 'app/components/Ref'
import PostItem from 'app/components/PostItem'

const Home = ({ sendRequest }) => {
  const [posts] = useSSR(() => sendRequest(getPosts()), {
    init: [],
    chainThen: (data) => data.posts,
  })

  return (
    <Column gap={30}>
      <span>
        <H2>This is home</H2>
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
        here to have a snoop around, don't let me stop you.
      </span>
      <span>
        <Divider />
      </span>
      <span>
        <H4>Brief background</H4>
      </span>
      <span>
        I'm a software engineer, orginally from Germany and now living and
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
        <H4 style={{ marginBottom: '20px' }}>Recent posts</H4>
        <Column>
          <List>
            {posts.map((p) => (
              <PostItem key={p._id} post={p} />
            ))}
          </List>
        </Column>
      </span>
    </Column>
  )
}

export default withRequest(Home)
