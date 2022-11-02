import { useMemo } from 'react';

import Button from 'src/components/ui/Button';

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

  return <div className="flex flex-row justify-end">{buttons}</div>;
};

export default Pagination;
