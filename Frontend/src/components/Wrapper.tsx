import { cn } from "@/lib/utils";

const Wrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        `border-2  flex  justify-center md:px-10  lg:px-28 xl:px-32   border-black min-h-screen w-full`,
        className
      )}
    >
      {children}
    </div>
  );
};

export default Wrapper;
