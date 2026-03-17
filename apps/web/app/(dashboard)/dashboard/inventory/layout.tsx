import { PropsWithChildren } from 'react';

const InventoryLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex-1">
      {children}
    </div>
  );
};

export default InventoryLayout;
