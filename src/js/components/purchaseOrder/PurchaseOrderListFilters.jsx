import React from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FilterForm from 'components/Filter/FilterForm';
import { debounceLocationsFetch, debounceUsersFetch } from 'utils/option-utils';


const PurchaseOrderListFilters = ({
  setFilterParams,
  debounceTime,
  minSearchLength,
  filterFields,
  defaultValues,
  formProps,
}) => {
  const debouncedOriginLocationsFetch = debounceLocationsFetch(
    debounceTime,
    minSearchLength,
    ['FULFILL_ORDER'],
    true,
    false,
    false,
  );
  const debouncedDestinationLocationsFetch = debounceLocationsFetch(
    debounceTime,
    minSearchLength,
    ['RECEIVE_STOCK'],
    true,
    false,
    false,
  );
  const debouncedUsersFetch = debounceUsersFetch(debounceTime, minSearchLength);

  return (
    <div className="d-flex flex-column list-page-filters">
      <FilterForm
        filterFields={filterFields}
        updateFilterParams={values => setFilterParams({ ...values })}
        formProps={{
          ...formProps,
          debouncedOriginLocationsFetch,
          debouncedDestinationLocationsFetch,
          debouncedUsersFetch,
        }}
        ignoreClearFilters={['destination']}
        defaultValues={defaultValues}
        allowEmptySubmit
        searchFieldPlaceholder="Search by order number or name or supplier"
        hidden={false}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  debounceTime: state.session.searchConfig.debounceTime,
  minSearchLength: state.session.searchConfig.minSearchLength,
});

export default connect(mapStateToProps)(PurchaseOrderListFilters);

PurchaseOrderListFilters.propTypes = {
  setFilterParams: PropTypes.func.isRequired,
  debounceTime: PropTypes.number.isRequired,
  minSearchLength: PropTypes.number.isRequired,
  filterFields: PropTypes.shape({}).isRequired,
  defaultValues: PropTypes.shape({}).isRequired,
  formProps: PropTypes.shape({}).isRequired,
};
