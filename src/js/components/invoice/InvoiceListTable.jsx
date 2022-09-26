import React, { useEffect, useRef, useState } from 'react';

import _ from 'lodash';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {
  RiFileLine,
  RiInformationLine,
  RiPencilLine,
} from 'react-icons/all';
import { getTranslate } from 'react-localize-redux';
import { connect } from 'react-redux';
import { Tooltip } from 'react-tippy';

import DataTable, { TableCell } from 'components/DataTable';
import InvoiceStatus from 'components/invoice/InvoiceStatus';
import ActionDots from 'utils/ActionDots';
import apiClient from 'utils/apiClient';
import { findActions } from 'utils/list-utils';
import Translate, { translateWithDefaultMessage } from 'utils/Translate';

import 'react-table/react-table.css';


const InvoiceListTable = ({
  filterParams,
  supportedActivities,
  highestRole,
  invoiceStatuses,
}) => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(-1);
  const [totalData, setTotalData] = useState(0);
  // Stored searching params for export case

  // Util ref for react-table to force the fetch of data
  const tableRef = useRef(null);
  const fireFetchData = () => {
    tableRef.current.fireFetchData();
  };

  // If filterParams change, refetch the data with applied filters
  useEffect(() => fireFetchData(), [filterParams]);


  // List of all actions for invoice rows
  const actions = [
    {
      label: 'react.invoice.viewDetails.label',
      defaultLabel: 'View Invoice Details',
      leftIcon: <RiInformationLine />,
      href: '/openboxes/invoice/show',
    },
    {
      label: 'react.purchaseOrder.addDocument.label',
      defaultLabel: 'Add document',
      leftIcon: <RiFileLine />,
      href: '/openboxes/invoice/addDocument',
    },
    {
      label: 'react.invoice.edit.label',
      defaultLabel: 'Edit Invoice',
      leftIcon: <RiPencilLine />,
      href: '/openboxes/invoice/create',
    },
  ];

  // Columns for react-table
  const columns = [
    {
      Header: ' ',
      width: 50,
      sortable: false,
      style: { overflow: 'visible', zIndex: 1 },
      Cell: row => (
        <ActionDots
          dropdownPlacement="right"
          dropdownClasses="action-dropdown-offset"
          actions={findActions(actions, row, supportedActivities, highestRole)}
          id={row.original.id}
        />),
    },
    {
      Header: '# items',
      accessor: 'itemCount',
      className: 'active-circle d-flex justify-content-center',
      headerClassName: 'header justify-content-center',
      maxWidth: 100,
      Cell: row => (<span className="items-count-circle d-flex align-items-center justify-content-center align-self-center">{row.original.itemCount}</span>),
    },
    {
      Header: 'Status',
      accessor: 'status',
      width: 250,
      Cell: (row) => {
        const label = invoiceStatuses &&
          invoiceStatuses.find(status => status.id === row.original.status).label;
        return (<InvoiceStatus status={label || row.original.status} />);
      },
    },
    {
      Header: 'Invoice Type',
      accessor: 'invoiceTypeCode',
      Cell: row => (
        <Tooltip
          theme="transparent"
          delay="150"
          duration="250"
          hideDelay="50"
          title={row.original.invoiceTypeCode}
        >
          {row.original.invoiceTypeCode}
        </Tooltip>
      ),
    },
    {
      Header: 'Invoice Number',
      accessor: 'invoiceNumber',
      sortable: false,
      Cell: row => (<TableCell link={`/openboxes/invoice/show/${row.original.id}`} />),
    },
    {
      Header: 'Vendor',
      accessor: 'partyCode',
    },
    {
      Header: 'Vendor invoice number',
      accessor: 'vendorInvoiceNumber',
      minWidth: 200,
      Cell: row => (
        <Tooltip
          theme="transparent"
          delay="150"
          duration="250"
          hideDelay="50"
          title={row.original.vendorInvoiceNumber}
        >
          {row.original.vendorInvoiceNumber}
        </Tooltip>
      ),
    },
    {
      Header: 'Total Value',
      accessor: 'totalValue',
      headerClassName: 'text-left',
      sortable: false,
    },
    {
      Header: 'Currency',
      accessor: 'currency',
      className: 'text-left',
    },
  ];


  const onFetchHandler = (state) => {
    const offset = state.page > 0 ? (state.page) * state.pageSize : 0;
    const sortingParams = state.sorted.length > 0 ?
      {
        sort: state.sorted[0].id,
        order: state.sorted[0].desc ? 'desc' : 'asc',
      } :
      {
        sort: 'dateInvoiced',
        order: 'desc',
      };


    const params = _.omitBy({
      offset: `${offset}`,
      max: `${state.pageSize}`,
      ...sortingParams,
      ...filterParams,
      status: filterParams.status && filterParams.status.value,
      invoiceTypeCode: filterParams.invoiceTypeCode && filterParams.invoiceTypeCode.id,
      vendor: filterParams.vendor && filterParams.vendor.id,
      createdBy: filterParams.createdBy && filterParams.createdBy.id,
      buyerOrganization: filterParams.buyerOrganization && filterParams.buyerOrganization.id,
    }, _.isEmpty);

    // Fetch data
    setLoading(true);
    apiClient.get('/openboxes/api/invoices', {
      params,
      paramsSerializer: parameters => queryString.stringify(parameters),
    })
      .then((res) => {
        setLoading(false);
        setPages(Math.ceil(res.data.totalCount / state.pageSize));
        setTotalData(res.data.totalCount);
        setOrdersData(res.data.data);
      })
      .catch(() => Promise.reject(new Error(this.props.translate('react.purchaseOrder.error.purchaseOrderList.label', 'Could not fetch purchase order list'))));
  };


  return (
    <div className="list-page-list-section">
      <div className="title-text p-3 d-flex justify-content-between align-items-center">
        <span>
          <Translate id="react.invoice.list.label" defaultMessage="List Invoices" />
        </span>
      </div>
      <DataTable
        manual
        sortable
        ref={tableRef}
        columns={columns}
        data={ordersData}
        loading={loading}
        totalData={totalData}
        defaultPageSize={10}
        pages={pages}
        onFetchData={onFetchHandler}
        noDataText="No invoices match the given criteria"
      />
    </div>
  );
};

const mapStateToProps = state => ({
  supportedActivities: state.session.supportedActivities,
  highestRole: state.session.highestRole,
  translate: translateWithDefaultMessage(getTranslate(state.localize)),
  currencyCode: state.session.currencyCode,
  invoiceStatuses: state.invoices.statuses,
});


export default connect(mapStateToProps)(InvoiceListTable);


InvoiceListTable.propTypes = {
  filterParams: PropTypes.shape({}).isRequired,
  supportedActivities: PropTypes.arrayOf(PropTypes.string).isRequired,
  highestRole: PropTypes.string.isRequired,
  invoiceStatuses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    variant: PropTypes.string.isRequired,
  })).isRequired,
};
