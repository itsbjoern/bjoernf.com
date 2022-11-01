import React, { useState, useCallback } from 'react';
import { toast } from 'react-toast';

import { login } from 'app/api/admin';
import { useRequest } from 'app/providers/RequestProvider';

import AccountCircleIcon from 'app/components/icons/AccountCircle.svg';
import VpnKeyIcon from 'app/components/icons/VpnKey.svg';
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
    <div className="flex justify-center">
      <div className="mt-24 flex w-1/2 flex-col gap-4">
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
        <div className="jusify-end flex flex-row">
          <Button variant="outlined" onClick={tryLogin}>
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
