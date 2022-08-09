import React, { useEffect, useState } from 'react';
import {
  FormControlLabel,
  FormControl,
  Switch,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';

import { getViews } from 'app/api/admin';
import { withRequest } from 'app/providers/RequestProvider';
import { Column, Row } from 'app/components/Flex';

import ViewCount from './Charts/ViewCount';
import Journey from './Charts/Journey';
import Funnel from './Charts/Funnel';

const Analytics = ({ sendRequest }) => {
  const [fetchedViews, setFetchedViews] = useState([]);
  const [views, setViews] = useState();
  const [span, setSpan] = useState(14);
  const [includeAdmin, setIncludeAdmin] = useState(false);

  useEffect(() => {
    sendRequest(getViews(span)).success((data) => {
      setFetchedViews(data.views);
    });
  }, [span]);

  useEffect(() => {
    setViews(
      fetchedViews.filter(
        (v) => (includeAdmin || !v.isAdmin) && !v.isProbablyBot && v.jsEnabled
      )
    );
  }, [fetchedViews, includeAdmin]);

  if (!views) {
    return <div>Loading...</div>;
  }

  return (
    <Column style={{ marginTop: 50 }} gap={50}>
      <Row justify="between">
        <FormControlLabel
          control={
            <Switch
              checked={includeAdmin}
              onChange={() => setIncludeAdmin((prev) => !prev)}
            />
          }
          label="Include admin views"
        />
        <FormControl variant="filled">
          <InputLabel id="select-time-span-label">Time span</InputLabel>
          <Select
            labelId="select-time-span-label"
            value={span}
            onChange={(event) => {
              setSpan(event.target.value);
            }}
          >
            <MenuItem value={7}>1 week</MenuItem>
            <MenuItem value={14}>2 weeks</MenuItem>
            <MenuItem value={30}>1 month</MenuItem>
            <MenuItem value={365}>1 year</MenuItem>
          </Select>
        </FormControl>
      </Row>
      <Row>
        <ViewCount views={views} />
        <Journey views={views} />
      </Row>
      <Row>
        <Funnel views={views} />
      </Row>
    </Column>
  );
};

export default withRequest(Analytics);
