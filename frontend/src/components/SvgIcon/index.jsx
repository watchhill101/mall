import React from "react";
import "./SvgIcon.scss";

const SvgIcon = ({
  name,
  width = "1em",
  height = "1em",
  color = "currentColor",
  className = "icon-svg",
}) => {
  // 如果没有提供name，显示默认图标
  if (!name) {
    return (
      <svg
        className={className}
        style={{ width, height, fill: color }}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      style={{ width, height, fill: color }}
      aria-hidden="true"
    >
      <use href={`#icon-${name}`} />
    </svg>
  );
};

export default SvgIcon; // ✅ 确保有默认导出
