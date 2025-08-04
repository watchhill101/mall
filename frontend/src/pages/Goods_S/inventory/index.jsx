import React from 'react';
import { Outlet } from 'react-router-dom';

export default function index() {
  return (
    <div>
      库存管理
      <Outlet></Outlet>
    </div>
  );
}
