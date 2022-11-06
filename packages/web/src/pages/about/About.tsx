import React from 'react';

import Ref from 'src/components/Ref';
import Divider from 'src/components/ui/Divider';

const About = () => {
  return (
    <div className="flex flex-col gap-7">
      <span>
        <h3 className="text-xl font-bold">How it&apos;s made</h3>
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
        <Ref href="https://github.com/BFriedrichs/bjornf.dev" />
      </span>
      <span>
        <Divider />
      </span>
      <span>
        <h3 className="text-xl font-bold">Privacy / Tracking</h3>
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
    </div>
  );
};

export default About;
