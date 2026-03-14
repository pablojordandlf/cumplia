import { PropsWithChildren } from 'react';

// This layout can be extended with common UI elements like a sidebar, header, etc.
// For now, it's a simple wrapper to maintain the structure for the inventory section.
const InventoryLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col">
      {/*
        You can add common layout elements here, such as:
        - Header/Navbar
        - Sidebar navigation
      */}
      <main className="flex-1">{children}</main>
      {/*
        You can add footer elements here if needed.
      */}
    </div>
  );
};

export default InventoryLayout;
