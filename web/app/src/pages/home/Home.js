import React from 'react'

import { Divider } from '@mui/material'

import { Column } from 'app/components/Flex'
import { H4 } from 'app/components/Text'
import Ref from 'app/components/Ref'

const Home = () => {
  return (
    <Column>
      <p>
        <H4>I am...</H4>
      </p>
      <p>
        someone that likes to dabble and try things. And sometimes it just goes
        unexpectedly well.
      </p>
      <p>
        As I finally came around to the idea of starting{' '}
        <Ref text="blog" href="/blog" /> posts about stuff I like to work on I
        am designating this space for my hobby projects and other interesting
        titbits I encounter when working.
      </p>
      <p>
        I have always enjoyed learning (and educating others) with all the weird
        little kinks and intricacies programming throws at you all the time.
        Maybe I can shed some light on these weirdnesses or maybe you are just
        here to have a snoop around, don't let me stop you.
      </p>
      <p>
        <Divider />
      </p>
      <p>
        <H4>About me</H4>
      </p>
      <p>
        I'm a software engineer, orginally from Germany and now living and
        working in the UK. As of right now I am employed at
        <Ref text="Simply Do Ideas" href="https://simplydo.co.uk" />.
      </p>
      <p>
        I am currently working on my PhD at{' '}
        <Ref text="Cardiff University" href="https://cardiff.ac.uk" /> (started
        in 2019). I have always been fascinated with the psychology surrounding
        the use of technology and being able to research Human Computer
        Interaction to this extent is a great experience.
      </p>
    </Column>
  )
}

export default Home
