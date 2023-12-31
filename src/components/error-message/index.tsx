/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */

import React from 'react';
import isEqual from 'react-fast-compare';
import theme from 'src/styles/theme';

import { css } from '@emotion/react';

interface ErrorMessageProps {
  className?: string;
  children: React.ReactNode;
}
const ErrorMessage: React.FC<ErrorMessageProps> = React.memo(({ children, className }) => {
  return (
    <div
      className={className}
      css={css`
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 17px;
        color: ${theme.text.errorColor};
        text-align: left;
        margin-top: 5px;
      `}
    >
      {children}
    </div>
  );
}, isEqual);

export default ErrorMessage;
