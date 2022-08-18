import { useMemo } from 'react';

import { Row } from 'app/components/Flex';
import Button from 'app/components/ui/Button';

const Pagination = ({ onChange, page, count }) => {
  const buttons = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => {
        return (
          <Button
            key={`paginate-${i}`}
            variant={i + 1 === page ? 'contained' : 'text'}
            onClick={(e) => {
              onChange(e, i + 1);
            }}
          >
            {i + 1}
          </Button>
        );
      }),
    [count, page]
  );

  return <Row justify="end">{buttons}</Row>;
};

export default Pagination;
