import React, { useState, useContext, useCallback } from 'react'

import { TextField, Button, InputAdornment } from '@mui/material'
import { AccountCircle, VpnKey } from '@mui/icons-material'

import { Flex, Column } from 'app/components/Flex'
import { RequestContext } from 'app/providers/RequestProvider'
import { NotificationContext } from 'app/providers/NotificationProvider'
import { login } from 'app/api/admin'

const Login = () => {
  const { sendRequest, setToken } = useContext(RequestContext)
  const { createNotification } = useContext(NotificationContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const tryLogin = useCallback(() => {
    sendRequest(login(username, password))
      .then((response) => {
        setToken(response.token)
      })
      .catch((err) => createNotification(`Login failed: ${err}`, 'error'))
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

export default Login
