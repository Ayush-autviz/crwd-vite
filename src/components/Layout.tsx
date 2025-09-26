
interface LayoutProps {
  readonly children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      {/* Main Content with Mobile and Desktop Views */}
      <div className="">
        {/* Mobile Content */}
        <div className="md:hidden no-scrollbar">
          {/* Main Content */}
          {children}
        </div>

        {/* Desktop Content */}
        <div className="hidden md:block">
          {/* Main Content */}
          {children}
        </div>
      </div>
    </>
  );
}
