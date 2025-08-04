import React, { useState } from 'react';

export default function Index() {
  const [btnList, setBtnlist] = useState([
    '全部',
    '零售',
    '家政',
    '烘焙',
    '文旅',
    '洗衣',
    '养老',
    '食堂',
  ]);
  return (
    <div className="OrderS">
      <div className="header">
        <ul>
          {btnList.map((item, index) => {
            return (
              <li key={index}>
                <a href="javascript:;">{item}</a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
