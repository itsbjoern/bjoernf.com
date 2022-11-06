import { FunctionalComponent } from 'preact';

import classes from './style.module.scss';

const severities = {
  warning: ['rgb(255, 244, 229)', 'rgb(102, 60, 0)'],
  success: ['rgb(237, 247, 237)', 'rgb(30, 70, 32)'],
};

type AlertProps = {
  severity: 'warning' | 'success';
};

const Alert: FunctionalComponent<AlertProps> = ({ severity, ...props }) => (
  <div
    style={{
      backgroundColor: severities[severity][0],
      color: severities[severity][1],
    }}
    className={`${classes.alert}`}
    {...props}
  />
);

export default Alert;
