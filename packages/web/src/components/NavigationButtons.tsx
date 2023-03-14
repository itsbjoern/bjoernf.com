import React, { FunctionComponent } from 'react';
import { useLocation, Link } from 'react-router-dom';

import Ripples from 'src/lib/Ripples';

import { ReactComponent as AccountTreeIcon } from 'src/components/icons/AccountTree.svg';
import { ReactComponent as HomeIcon } from 'src/components/icons/Home.svg';
import { ReactComponent as ReceiptIcon } from 'src/components/icons/Receipt.svg';

import classes from './styles.module.scss';

type FullButtonProps = {
  label: string;
  icon: JSX.Element;
  to: string;
  selected: boolean;
};

const FullButton: FunctionComponent<FullButtonProps> = ({
  label,
  icon,
  to,
  selected,
  ...props
}) => (
  <Ripples className="rounded-lg">
    <Link
      className={`${classes.navAction} ${
        selected ? 'text-primary' : 'text-[#9E829C]'
      }`}
      style={{ minWidth: 85, flex: 1 }}
      to={to}
      {...props}
    >
      {icon}
      <span>{label}</span>
    </Link>
  </Ripples>
);

type NavigationButtonProps = {
  mobile?: boolean;
};

const paths = ['/', '/blog', '/projects'];
const NavigationButtons: FunctionComponent<NavigationButtonProps> = ({
  mobile,
}) => {
  const location = useLocation();
  const split = location.pathname.split('/');
  const menuIndex = split.length === 1 ? 0 : paths.indexOf('/' + split[1]);

  return (
    <div
      className={`smo:shadow-[0 1px 10px 4px rgb(0 0 0 / 20%)] z-[100] h-[56px] content-evenly justify-center smo:sticky smo:bottom-0 smo:left-0 smo:w-full smo:bg-paper ${
        mobile ? 'hidden smo:flex' : 'flex smo:hidden'
      }`}
    >
      <FullButton
        label="Home"
        icon={<HomeIcon />}
        selected={menuIndex === 0}
        to={paths[0]}
      />
      <FullButton
        label="Blog"
        icon={<ReceiptIcon />}
        selected={menuIndex === 1}
        to={paths[1]}
      />
      <FullButton
        label="Projects"
        icon={<AccountTreeIcon />}
        selected={menuIndex === 2}
        to={paths[2]}
      />
    </div>
  );
};

export default NavigationButtons;
