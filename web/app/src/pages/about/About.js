import React from 'react'

import {
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'

import { Column } from 'app/components/Flex'
import { H4 } from 'app/components/Text'
import Ref from 'app/components/Ref'

import collectionData from './collectionData'

const About = () => {
  return (
    <Column gap={30}>
      <span>
        <H4>How it's made</H4>
      </span>
      <span>
        This website is built using React and delivered using aiohttp and
        supported by MongoDB. Everything is dockerised and I use this handy
        <Ref
          text="Let's Encrypt Companion"
          href="https://github.com/nginx-proxy/acme-companion"
        />
        to do the signing legwork for me.
      </span>
      <span>
        I generated my colors using{' '}
        <Ref text="Coolors.co" href="https://coolors.co" />
      </span>
      <span>
        The best part: All the code is public at{' '}
        <Ref href="https://github.com/BFriedrichs/blog" />
      </span>
      <span>
        <Divider />
      </span>
      <span>
        <H4>Privacy / Tracking</H4>
      </span>
      <span>
        I use self-built analytics that do not interface with any third party. A
        custom header tracks the same session of clicks through the website, a
        website refresh or new tab resets this. The information I collect is
        mostly basic and just for personal housekeeping.
      </span>
      <span>
        At no point do I collect or save any data that can be traced to an
        individual (including IP addresses or geo location data) or maintain
        information of an individual across multiple sessions or websites (no
        setting of cookies or application storage).
      </span>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          Check the data I collect
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Description</TableCell>
                  <TableCell align="right">Example</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collectionData.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.description}</TableCell>
                    <TableCell align="right">{row.example}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Column>
  )
}

export default About
