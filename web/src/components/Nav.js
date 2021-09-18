import React from 'react';

import { Link, withRouter } from 'react-router-dom';
import { Button } from '@mui/material';

const Nav = () => {
  return (
    <nav>
      <Button variant='text' as={Link} to='/'>Home</Button>
    </nav>
  );
};

export default withRouter(Nav);
