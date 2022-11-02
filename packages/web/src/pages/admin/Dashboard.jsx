import React, { useState } from 'react';
import { toast } from 'react-toast';

import { changePassword } from 'src/api/admin';
import { useRequest } from 'src/providers/RequestProvider/hooks';

import VisibilityIcon from 'src/components/icons/Visibility.svg';
import VisibilityOffIcon from 'src/components/icons/VisibilityOff.svg';
import Button, { IconButton } from 'src/components/ui/Button';
import TextField from 'src/components/ui/TextField';

const Dashboard = () => {
  const { sendRequest } = useRequest();
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-8 flex w-96 flex-col gap-5">
        <h2 className="text-xl font-bold">Analytics</h2>
        <Button
          variant="contained"
          onClick={() => {
            window.open('https://dashboard.bjornf.dev', '_blank');
          }}
        >
          Visit
        </Button>
      </div>
      <div className="mt-8 flex w-96 flex-col gap-5">
        <h2 className="text-xl font-bold">Update password</h2>
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
      </div>
    </div>
  );
};

export default Dashboard;
