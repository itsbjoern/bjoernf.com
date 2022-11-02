import React from 'react';

import Ref from 'src/components/Ref';
import Divider from 'src/components/ui/Divider';

const Projects = () => {
  return (
    <div className="flex flex-col gap-7">
      <span>
        <h2 className="text-2xl font-bold">Projects</h2>
      </span>
      <span>
        <h3 className="text-xl font-bold">Research</h3>
      </span>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col">
          <Ref
            text="Discovering Types of Smartphone Usage Sessions from User-App Interactions"
            href="https://ieeexplore.ieee.org/abstract/document/9431034"
          />
          In this paper, we examine how embedding physical user-app activity
          (e.g., taps and scrolls) can provide a rich basis for summarising
          device usage. Using a large dataset of 82,758,449 interaction events
          from 86 users over an 8-week period we combine feature embedding and
          unsupervised learning to extract prominent interactions within
          clusters of smartphone usage sessions.
        </div>
        <div className="flex flex-col">
          <Ref
            text="Utilising the co-occurrence of user interface interactions as a risk indicator for smartphone addiction"
            href="https://doi.org/10.1016/j.pmcj.2022.101677"
          />
          The study highlights a novel methodology to transform and analyse
          large amounts of interaction events to infer a user&apos;s level of
          smartphone addiction. This is a step forward from using commonly used
          metrics such as pure screen on time which can misrepresent the
          cognitive complexities and dependencies of human behaviour.
        </div>
      </div>
      <span>
        <Divider />
      </span>
      <span>
        <h3 className="text-xl font-bold">Code</h3>
      </span>
      <div className="flex flex-col gap-7">
        <div className="flex flex-row gap-7">
          <div className="neo flex flex-1 flex-col rouded-lg p-4">
            <b>Nintendo Switch - GBA Emulator</b>
            <Ref
              text="On GitHub"
              href="https://github.com/BFriedrichs/switch-gba"
            />
            <span>
              Utilising the restricted Nintendo Switch browser to capture input
              and receive streamed emulator data from a remote Python server.
            </span>
          </div>
          <div className="neo flex flex-1 flex-col rouded-lg p-4">
            <b>Big Brain Sudokus</b>
            <Ref
              text="On the App Store"
              href="https://apps.apple.com/gb/app/big-brain-sudokus/id1521326123"
            />
            <span>
              A Sudoku application written in React Native and managed via
              <Ref text="Expo" href="https://expo.dev/" />. The free and
              shareable Sudokus are available in 9 difficulties.
            </span>
          </div>
        </div>
        <div className="flex flex-row gap-7">
          <div className="neo flex flex-1 flex-col rouded-lg p-4">
            <b>This website</b>
            <Ref
              text="On GitHub"
              href="https://github.com/BFriedrichs/bjornf.dev"
            />
            <span>
              A custom built website using React + aiohttp. Includes server side
              rendering and a a ProseMirror powered WYSIWYG editor.
            </span>
          </div>
          <div className="neo flex flex-1 flex-col rouded-lg p-4">
            <b>Infrared sound remote</b>
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
          </div>
        </div>
        <div className="flex flex-row gap-7">
          <div className="neo flex flex-1 flex-col rouded-lg p-4">
            <b>And much more...</b>
            <span>
              There is a lot of testing, prodding and half-finished bits. Feel
              free to visit my
              <Ref text="GitHub" href="https://github.com/BFriedrichs" />{' '}
              profile to see them.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
