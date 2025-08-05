import React from "react";
import "./SvgIcon.scss";

const SvgIcon = ({
  name,
  width = "1em",
  height = "1em",
  color = "currentColor",
  className = "icon-svg",
}) => {
  return (
    <svg
      className={className}
      style={{ width, height, fill: color }}
      aria-hidden="true"
    >
      <use xlinkHref={`#icon-${name}`} />
    </svg>
  );
};

export default SvgIcon; // ✅ 确保有默认导出
