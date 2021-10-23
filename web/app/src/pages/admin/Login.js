import React, { useState, useCallback } from 'react'

import { TextField, Button, InputAdornment } from '@mui/material'
import { AccountCircle, VpnKey } from '@mui/icons-material'

import { Flex, Column } from 'app/components/Flex'
import { withRequest } from 'app/providers/RequestProvider'
import { withNotification } from 'app/providers/NotificationProvider'
import { login } from 'app/api/admin'

const Login = ({ sendRequest, setToken, createNotification }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const tryLogin = useCallback(() => {
    sendRequest(login(username, password))
      .success((response) => {
        setToken(response.token)
      })
      .failure((err) =>
        createNotification(`Login failed: ${err.message}`, 'error')
      )
  }, [username, password, sendRequest])

  return (
    <Flex justify="center">
      <Column gap={15} style={{ marginTop: 100, width: '50%' }}>
        <TextField
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          label="Username"
          onKeyDown={(evt) => (evt.key === 'Enter' ? tryLogin() : null)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          label="Password"
          type="password"
          onKeyDown={(evt) => (evt.key === 'Enter' ? tryLogin() : null)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <VpnKey />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="outlined" onClick={tryLogin}>
          Login
        </Button>
      </Column>
    </Flex>
  )
}

export default withRequest(withNotification(Login))
