import React from 'react';
import styled from 'styled-components';

import { morphMixin } from 'app//theme';

import { Column, Row } from 'app/components/Flex';
import Ref from 'app/components/Ref';
import { H2, H4 } from 'app/components/Text';
import Divider from 'app/components/ui/Divider';

const ProjectBlock = styled(Column)`
  flex: 1;
  padding: 15px;
  ${morphMixin()}
`;

const Projects = () => {
  return (
    <Column gap={30}>
      <span>
        <H2>Projects</H2>
      </span>
      <span>
        <H4>Research</H4>
      </span>
      <Column>
        <Ref
          text="Discovering Types of Smartphone Usage Sessions from User-App Interactions"
          href="https://ieeexplore.ieee.org/abstract/document/9431034"
        />
        In this paper, we examine how embedding physical user-app activity
        (e.g., taps and scrolls) can provide a rich basis for summarising device
        usage. Using a large dataset of 82,758,449 interaction events from 86
        users over an 8-week period we combine feature embedding and
        unsupervised learning to extract prominent interactions within clusters
        of smartphone usage sessions.
      </Column>
      <span>
        <Divider />
      </span>
      <span>
        <H4>Code</H4>
      </span>
      <Column gap={30}>
        <Row gap={30}>
          <ProjectBlock>
            <H4>Nintendo Switch - GBA Emulator</H4>
            <Ref
              text="On GitHub"
              href="https://github.com/BFriedrichs/switch-gba"
            />
            <span>
              Utilising the restricted Nintendo Switch browser to capture input
              and receive streamed emulator data from a remote Python server.
            </span>
          </ProjectBlock>
          <ProjectBlock>
            <H4>Big Brain Sudokus</H4>
            <Ref
              text="On the App Store"
              href="https://apps.apple.com/gb/app/big-brain-sudokus/id1521326123"
            />
            <span>
              A Sudoku application written in React Native and managed via
              <Ref text="Expo" href="https://expo.dev/" />. The free and
              shareable Sudokus are available in 9 difficulties.
            </span>
          </ProjectBlock>
        </Row>
        <Row gap={30}>
          <ProjectBlock>
            <H4>This website</H4>
            <Ref
              text="On GitHub"
              href="https://github.com/BFriedrichs/bjornf.dev"
            />
            <span>
              A custom built website using React + aiohttp. Includes server side
              rendering and a a ProseMirror powered WYSIWYG editor.
            </span>
          </ProjectBlock>
          <ProjectBlock>
            <H4>Infrared sound remote</H4>
            <Ref
              text="On GitHub"
              href="https://github.com/BFriedrichs/pi-remote"
            />
            <span>
              Problem: Speakers that connect to a TV with a proprietary remote
              control. Solution: A infrared transceiver and a{' '}
              <Ref text="RPi" href="https://www.raspberrypi.org/" /> + a local
              web server.
            </span>
          </ProjectBlock>
        </Row>
        <Row gap={30}>
          <ProjectBlock>
            <H4>And much more...</H4>
            <span>
              There is a lot of testing, prodding and half-finished bits. Feel
              free to visit my
              <Ref text="GitHub" href="https://github.com/BFriedrichs" />{' '}
              profile to see them.
            </span>
          </ProjectBlock>
        </Row>
      </Column>
    </Column>
  );
};

export default Projects;
