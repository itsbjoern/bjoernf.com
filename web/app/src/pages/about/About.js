import React from 'react';

import { Column } from 'app/components/Flex';
import Ref from 'app/components/Ref';
import { H4 } from 'app/components/Text';
import Divider from 'app/components/ui/Divider';

const About = () => {
  return (
    <Column gap={30}>
      <span>
        <H4>How it&apos;s made</H4>
      </span>
      <span>
        This website is built using React and delivered using{' '}
        <Ref text="aiohttp" href="https://docs.aiohttp.org/en/stable/" /> and
        supported by MongoDB. Everything is dockerised and I use this handy
        <Ref
          text="Let's Encrypt Companion"
          href="https://github.com/nginx-proxy/acme-companion"
        />
        to do the signing legwork for me. You can visit any page with JavaScript
        disabled to view a static server-side rendered version of this website.
      </span>
      <span>
        My blog posts are written using a WYSIWYG editor made from{' '}
        <Ref text="ReMirror" href="https://remirror.io/" />. I generated my
        colors using <Ref text="Coolors.co" href="https://coolors.co" />
      </span>
      <span>
        The best part: All the code is public at{' '}
        <Ref href="https://github.com/BFriedrichs/blog" />
      </span>
      <span>
        <Divider />
      </span>
      <span>
        <H4>Privacy / Tracking</H4>
      </span>
      <span>
        To get information about the behavior of my visitors, I use{' '}
        <Ref text="Ackee" href="https://ackee.electerious.com" />. This
        analytics software gives me insight about my visitors only in general,
        but not about individuals per se, as it does not track visitors and does
        not store any personal identifiable information.{' '}
        <Ref
          text="Go to their documentation"
          href="https://docs.ackee.electerious.com/#/docs/Anonymization"
        />
        to find out what Ackee collects. Please note that I do collect the
        detailed information as outlined on their page.
      </span>
    </Column>
  );
};

export default About;
