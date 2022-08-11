import React, { useState } from 'react';
import { TextField, Button, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { H2 } from 'app/components/Text';
import { Column } from 'app/components/Flex';
import { withRequest } from 'app/providers/RequestProvider';
import { withNotification } from 'app/providers/NotificationProvider';
import { changePassword } from 'app/api/admin';

const Dashboard = ({ sendRequest, createNotification }) => {
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Column flexed>
      <Column style={{ width: 400, marginTop: 30 }} gap={20}>
        <H2>Update password</H2>
        <TextField
          value={pass1}
          type={isVisible ? 'text' : 'password'}
          label="Enter password"
          onChange={(e) => setPass1(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setIsVisible((v) => !v)}>
                  {isVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
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
                createNotification('Successfully updated password');
                setPass1('');
                setPass2('');
              })
              .failure(() => {
                createNotification('There was an issue', 'error');
              });
          }}
        >
          Confirm change
        </Button>
      </Column>
    </Column>
  );
};

export default withRequest(withNotification(Dashboard));
