import React, { useState, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';

import { Column } from 'app/components/Flex';
import { H2 } from 'app/components/Text';

import { reduceData } from './utils';

const ViewCount = ({ views }) => {
  const [viewData, setViewData] = useState();
  useEffect(() => {
    const getDate = (v) => new Date(v.createdAt * 1000);
    const reducedUnqiue = reduceData(views, {
      key: (v) => getDate(v).toDateString().split(' ').slice(1, 3).join(' '),
      reduce: (p, c) => (c.isUnique ? p + 1 : p),
      init: 0,
      toAxes: true,
    });
    const reducedTotal = reduceData(views, {
      key: (v) => getDate(v).toDateString().split(' ').slice(1, 3).join(' '),
      reduce: (p, c) => p + c.paths.length,
      init: 0,
      toAxes: true,
    });
    setViewData([
      {
        id: 'unique',
        data: reducedUnqiue,
      },
      {
        id: 'total',
        data: reducedTotal,
      },
    ]);
  }, [views]);

  return (
    <Column style={{ height: 350 }} flexed>
      <H2>Unique Views</H2>
      <ResponsiveLine
        data={viewData}
        useMesh={true}
        colors={{ scheme: 'category10' }}
        legends={[
          {
            anchor: 'top-right',
            direction: 'column',
            justify: false,
            translateX: 0,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
          },
        ]}
      />
    </Column>
  );
};

export default ViewCount;
