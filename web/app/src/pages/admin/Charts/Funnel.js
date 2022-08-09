import React, { useState, useEffect } from 'react';
import { ResponsiveFunnel } from '@nivo/funnel';

import { Column } from 'app/components/Flex';
import { H2 } from 'app/components/Text';

const endMarker = '/endSession';

const Funnel = ({ views }) => {
  const [data, setData] = useState();

  useEffect(() => {
    const layers = new Array(10).fill(0);
    views.forEach((view) => {
      const index = Math.min(view.paths.length, 10) - 1;
      layers[index] += 1;
    });

    setData(
      layers.map((l, i) => ({
        id: i,
        value: l,
        label: `${i + 1} Jumps`,
      }))
    );
  }, [views]);

  return (
    <Column style={{ height: 350 }} flexed>
      <H2>Funnel</H2>
      <ResponsiveFunnel data={data} />
    </Column>
  );
};

export default Funnel;
