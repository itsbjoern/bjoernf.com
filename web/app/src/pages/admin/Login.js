import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import React, { useState, useCallback } from 'react';
import { toast } from 'react-toast';

import { login } from 'app/api/admin';
import { useRequest } from 'app/providers/RequestProvider';

import { Flex, Row, Column } from 'app/components/Flex';
import Button from 'app/components/ui/Button';
import TextField from 'app/components/ui/TextField';

const Login = () => {
  const { sendRequest, setToken } = useRequest();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const tryLogin = useCallback(() => {
    sendRequest(login(username, password))
      .success((response) => {
        setToken(response.token);
      })
      .failure((err) => toast.error(`Login failed: ${err.message}`));
  }, [username, password, sendRequest]);

  return (
    <Flex justify="center">
      <Column gap={15} style={{ marginTop: 100, width: '50%' }}>
        <TextField
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          label="Username"
          onKeyDown={(evt) => (evt.key === 'Enter' ? tryLogin() : null)}
          icon={<AccountCircleIcon />}
        />
        <TextField
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          label="Password"
          type="password"
          onKeyDown={(evt) => (evt.key === 'Enter' ? tryLogin() : null)}
          icon={<VpnKeyIcon />}
        />
        <Row justify="end">
          <Button variant="outlined" onClick={tryLogin}>
            Login
          </Button>
        </Row>
      </Column>
    </Flex>
  );
};

export default Login;
