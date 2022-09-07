import React from 'react';

import _ from 'lodash';
import PropTypes from 'prop-types';

const MenuSubsection = ({ section, key, active }) => (
  <li className={`nav-item dropdown d-flex justify-content-center align-items-center ${active && 'active-section'}`} key={key}>
    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" aria-haspopup="true" aria-expanded="false">
      {section.label}
    </a>
    <div className={`dropdown-menu ${section.label === 'Reporting' && 'dropdown-menu-right'}`} aria-labelledby="navbarDropdown">
      <div className="dropdown-menu-subsections">
        {_.map(section.subsections, (subsection, subsectionKey) => (
          <div className="padding-8" key={subsectionKey}>
            {subsection.label && <span className="subsection-title">{subsection.label}</span>}
            {_.map(subsection.menuItems, (menuItem, menuItemKey) => (
              <a className="dropdown-item" key={menuItemKey} href={menuItem.href} target={menuItem.target}>
                {menuItem.label}
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  </li>
);

export default MenuSubsection;

MenuSubsection.propTypes = {
  section: PropTypes.shape({
    label: PropTypes.string,
    menuItems: PropTypes.shape([]),
    subsections: PropTypes.shape([]),
  }).isRequired,
  key: PropTypes.string,
  active: PropTypes.bool,
};

MenuSubsection.defaultProps = {
  active: false,
  key: '',
};
