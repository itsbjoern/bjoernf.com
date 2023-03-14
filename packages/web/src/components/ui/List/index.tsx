import { FunctionComponent, HTMLAttributes } from 'react';

import classes from './style.module.scss';

const List: FunctionComponent<HTMLAttributes<HTMLUListElement>> = (props) => (
  <ul className={classes.list} {...props} />
);

const ListItem: FunctionComponent<HTMLAttributes<HTMLLIElement>> = (
  props
) => <li className={classes.item} {...props} />;

export { List, ListItem };
