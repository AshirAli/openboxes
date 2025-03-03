import React from 'react';

import PropTypes from 'prop-types';

import Translate from 'utils/Translate';

const Button = ({
  label,
  defaultLabel,
  disabled,
  variant,
  type,
  onClick,
  EndIcon,
  isDropdown,
  StartIcon,
  className,
}) => {
  const buttonClass = 'd-flex justify-content-around align-items-center gap-8';
  const variantClass = `${variant}-button`;
  const dropDownClass = `${isDropdown ? 'dropdown-toggle' : ''}`;

  return (
    <button
      className={[variantClass, buttonClass, dropDownClass, className].join(' ')}
      disabled={disabled}
      type={type}
      onClick={onClick}
      data-toggle={isDropdown && 'dropdown'}
      aria-haspopup={isDropdown && 'true'}
      aria-expanded={isDropdown && 'false'}
    >
      <React.Fragment>
        {StartIcon && StartIcon}
        <Translate id={label} defaultMessage={defaultLabel} />
        {EndIcon && EndIcon}
      </React.Fragment>
    </button>
  );
};

export default Button;

Button.propTypes = {
  label: PropTypes.string.isRequired,
  defaultLabel: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'transparent',
    'primary-outline',
    'grayed',
  ]),
  onClick: PropTypes.func,
  EndIcon: PropTypes.element,
  StartIcon: PropTypes.element,
  isDropdown: PropTypes.bool,
  className: PropTypes.string,
};

Button.defaultProps = {
  disabled: false,
  isDropdown: false,
  type: 'button',
  variant: 'primary',
  onClick: undefined,
  EndIcon: null,
  StartIcon: null,
  className: '',
};
