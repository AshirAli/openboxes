import React from 'react';

import PropTypes from 'prop-types';

const MenuSection = ({ section, active }) => (
  <li className={`nav-item d-flex justify-content-center align-items-center ${active && 'active-section'}`} >
    <a className="nav-link" href={section.href}>
      {section.label}
    </a>
  </li>
);

export default MenuSection;

MenuSection.propTypes = {
  section: PropTypes.shape({
    label: PropTypes.string,
    href: PropTypes.string,
  }).isRequired,
  active: PropTypes.bool,
};

MenuSection.defaultProps = {
  active: false,
};
