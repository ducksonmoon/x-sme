import React from "react";
import WidgetConfigCard from "./WidgetConfigCard";

interface ConditionalWidgetConfigProps {
  show: boolean;
}

const ConditionalWidgetConfig: React.FC<ConditionalWidgetConfigProps> = ({
  show,
}) => {
  // Always render the component to maintain hook order
  return (
    <div style={{ display: show ? "block" : "none" }}>
      <WidgetConfigCard />
    </div>
  );
};

export default ConditionalWidgetConfig;
