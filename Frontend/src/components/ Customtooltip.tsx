import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { memo } from "react";

const Customtooltip = memo(
  ({
    children,
    title,
    side = "right",
  }: {
    children: React.ReactNode;
    title: string;
    href?: string;
    side?: "bottom" | "right" | "left" | "top";
  }) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>{children}</TooltipTrigger>
          <TooltipContent side={side} className="bg-white scale-110 ">
            <p>{title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

export default Customtooltip;
