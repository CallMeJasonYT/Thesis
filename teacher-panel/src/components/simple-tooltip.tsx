import type { ReactElement, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SimpleTooltipProps = {
  content?: string | ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  children: ReactNode;
};

const SimpleTooltip = ({
  content,
  side = "bottom",
  children,
}: SimpleTooltipProps): ReactElement =>
  content ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="bg-muted " side={side}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <>{children}</>
  );

export default SimpleTooltip;
