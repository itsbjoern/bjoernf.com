import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useRequest } from 'src/providers/RequestProvider';
import { getFileUrl } from 'src/util';

import { ReactComponent as AdminPanelSettingsIcon } from 'src/components/icons/AdminPanelSettings.svg';
import { ReactComponent as ArrowCircleUpIcon } from 'src/components/icons/ArrowCircleUp.svg';
import { ReactComponent as GitHubIcon } from 'src/components/icons/GitHub.svg';
import { ReactComponent as TwitterIcon } from 'src/components/icons/Twitter.svg';
import { ReactComponent as LogoutIcon } from 'src/components/icons/Logout.svg';
import Chip from 'src/components/ui/Chip';
import Divider from 'src/components/ui/Divider';

import NavigationButtons from './NavigationButtons';

const Header = () => {
  const navigate = useNavigate();
  const { token, setToken } = useRequest();

  return (
    <div className="neo flex flex-col gap-4 rounded-b-xl bg-paper p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center">
          <img
            className="h-16 w-16 rounded-full object-cover"
            src={getFileUrl('images/me.jpg')}
          />
          <div className="ml-4 flex flex-col justify-evenly">
            <h2 className="text-2xl font-bold">Björn Friedrichs</h2>
            <div className="flex flex-row items-center gap-1">
              <ArrowCircleUpIcon />
              <span>That&apos;s me</span>
            </div>
          </div>
        </div>
        <NavigationButtons />
      </div>

      <Divider />
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 justify-start">
          {token ? (
            <div className="flex gap-3">
              <Chip
                icon={<AdminPanelSettingsIcon />}
                label="Admin"
                onClick={() => navigate('/admin')}
              />
              <Chip
                icon={<LogoutIcon />}
                label="Sign out"
                onClick={() => setToken('')}
              />
            </div>
          ) : null}
        </div>
        <div className="flex justify-end gap-3">
          <Chip
            as="a"
            clickable
            icon={<GitHubIcon />}
            href="https://github.com/BFriedrichs"
            label="BFriedrichs"
            target="_blank"
          />
          <Chip
            as="a"
            clickable
            icon={<TwitterIcon />}
            href="https://twitter.com/bjornf_dev"
            label="bjornf_dev"
            target="_blank"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
