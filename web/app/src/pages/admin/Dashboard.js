import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import React, { useState } from 'react';
import { toast } from 'react-toast';

import { changePassword } from 'app/api/admin';
import { useRequest } from 'app/providers/RequestProvider';

import { Column } from 'app/components/Flex';
import { H2 } from 'app/components/Text';
import Button, { IconButton } from 'app/components/ui/Button';
import TextField from 'app/components/ui/TextField';

const Dashboard = () => {
  const { sendRequest } = useRequest();
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Column flexed>
      <Column style={{ width: 400, marginTop: 30 }} gap={20}>
        <H2>Analytics</H2>
        <Button
          variant="contained"
          onClick={() => {
            window.open('https://dashboard.bjornf.dev', '_blank');
          }}
        >
          Visit
        </Button>
      </Column>
      <Column style={{ width: 400, marginTop: 30 }} gap={20}>
        <H2>Update password</H2>
        <TextField
          value={pass1}
          type={isVisible ? 'text' : 'password'}
          label="Enter password"
          onChange={(e) => setPass1(e.target.value)}
          icon={
            <IconButton onClick={() => setIsVisible((v) => !v)}>
              {isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          }
        />
        <TextField
          error={pass2 !== '' && pass1 !== pass2}
          value={pass2}
          type={isVisible ? 'text' : 'password'}
          label="Repeat password"
          onChange={(e) => setPass2(e.target.value)}
        />
        <Button
          disabled={pass1 === '' || pass1 !== pass2}
          variant="contained"
          onClick={() => {
            sendRequest(changePassword(pass1))
              .success(() => {
                toast.success('Successfully updated password');
                setPass1('');
                setPass2('');
              })
              .failure(() => {
                toast.errro('There was an issue');
              });
          }}
        >
          Confirm change
        </Button>
      </Column>
    </Column>
  );
};

export default Dashboard;
