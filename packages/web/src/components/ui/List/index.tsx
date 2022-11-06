import { FunctionalComponent } from 'preact';
import { HTMLAttributes } from 'preact/compat';

import classes from './style.module.scss';

const List: FunctionalComponent<HTMLAttributes<HTMLUListElement>> = (props) => (
  <ul className={classes.list} {...props} />
);

const ListItem: FunctionalComponent<HTMLAttributes<HTMLLIElement>> = (
  props
) => <li className={classes.item} {...props} />;

export { List, ListItem };
