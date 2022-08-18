import styled from 'styled-components';

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
  padding-top: 8px;
  padding-bottom: 8px;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  -webkit-text-decoration: none;
  text-decoration: none;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
`;

export { List, ListItem };
