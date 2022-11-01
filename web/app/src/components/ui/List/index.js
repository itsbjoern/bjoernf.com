import { list, item } from './style.module.scss';

const List = (props) => <ul className={list} {...props} />;

const ListItem = (props) => <li className={item} {...props} />;

export { List, ListItem };
