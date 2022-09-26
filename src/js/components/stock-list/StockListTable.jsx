import React, { useEffect, useRef, useState } from 'react';

import fileDownload from 'js-file-download';
import _ from 'lodash';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { confirmAlert } from 'react-confirm-alert';
import {
  RiDeleteBinLine,
  RiDownload2Line,
  RiDownloadLine,
  RiEraserLine,
  RiFile3Line,
  RiFileCopyLine,
  RiFileForbidLine,
  RiInformationLine,
  RiListUnordered,
  RiPencilLine,
  RiUploadLine,
} from 'react-icons/all';
import { getTranslate } from 'react-localize-redux';
import { connect } from 'react-redux';
import Alert from 'react-s-alert';

import { hideSpinner, showSpinner } from 'actions';
import DataTable from 'components/DataTable';
import Button from 'components/form-elements/Button';
import ActionDots from 'utils/ActionDots';
import apiClient from 'utils/apiClient';
import { findActions } from 'utils/list-utils';
import StatusIndicator from 'utils/StatusIndicator';
import Translate, { translateWithDefaultMessage } from 'utils/Translate';

import 'react-confirm-alert/src/react-confirm-alert.css';

const StockListTable = ({
  filterParams,
  hideSpinner: hideTheSpinner,
  showSpinner: showTheSpinner,
  translate,
}) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(-1);
  // Stored searching params for export case
  const [currentParams, setCurrentParams] = useState({});
  const [totalData, setTotalData] = useState(0);

  const tableRef = useRef(null);

  const fireFetchData = () => tableRef.current.fireFetchData();

  // If filterParams change, refetch the data with applied filters
  useEffect(() => {
    fireFetchData();
  }, [filterParams]);

  const exportStockList = () => {
    apiClient.get('/openboxes/api/stocklists', {
      params: {
        ...currentParams,
        format: 'csv',
      },
      paramsSerializer: params => queryString.stringify(params),
    })
      .then((res) => {
        const filename = res.headers['content-disposition'].split('filename="')[1].split('.')[0];
        fileDownload(res.data, filename, 'text/csv');
      });
  };

  const exportStockListItems = (id) => {
    apiClient.get(`/openboxes/api/stocklists/${id}/export`)
      .then((res) => {
        const filename = res.headers['content-disposition'].split('filename="')[1].split('.')[0];
        fileDownload(res.data, filename, 'text/csv');
      });
  };

  const customActionFilter = ({ isPublished }, row) => {
    // skip actions that don't have isPublished property
    if (isPublished === undefined) return true;
    // show actions that have same boolean value in row and in action
    return row.original.isPublished === isPublished;
  };

  const deleteStocklists = (id) => {
    showTheSpinner();
    apiClient.delete(`/openboxes/api/stocklists/${id}`)
      .then((res) => {
        if (res.status === 204) {
          Alert.success(translate(
            'react.stocklists.delete.success.label',
            'Stock List has been deleted successfully',
          ));
          fireFetchData();
        }
      })
      .finally(() => hideTheSpinner());
  };

  const onClickDeleteStocklists = (id) => {
    const confirmButton = {
      label: translate('react.default.yes.label', 'Yes'),
      onClick: () => deleteStocklists(id),
    };
    const cancelButton = {
      label: translate('react.default.no.label', 'No'),
    };
    confirmAlert({
      title: translate(
        'react.stocklists.delete.confirm.title.label',
        'Confirm delete of stock list',
      ),
      message: translate(
        'react.stocklists.delete.confirm.message.label',
        'Are you sure you want to delete this stock list ?',
      ),
      buttons: [confirmButton, cancelButton],
    });
  };

  const clearStocklists = (id) => {
    showTheSpinner();
    apiClient.post(`/openboxes/api/stocklists/${id}/clear`)
      .then((res) => {
        if (res.status === 200) {
          Alert.success(translate(
            'react.stocklists.clear.success.label',
            'Stock List has been cleared Stock List has been cloned successfully',
          ));
          fireFetchData();
        }
      })
      .finally(() => hideTheSpinner());
  };

  const onClickClearStocklists = (id) => {
    const confirmButton = {
      label: translate('react.default.yes.label', 'Yes'),
      onClick: () => clearStocklists(id),
    };
    const cancelButton = {
      label: translate('react.default.no.label', 'No'),
    };
    confirmAlert({
      title: translate(
        'react.stocklists.clear.confirm.title.label',
        'Confirm clear of stock list',
      ),
      message: translate(
        'react.stocklists.clear.confirm.message.label',
        'Are you sure you want to clear this stock list ?',
      ),
      buttons: [confirmButton, cancelButton],
    });
  };

  const cloneStocklists = (id) => {
    showTheSpinner();
    apiClient.post(`/openboxes/api/stocklists/${id}/clone`)
      .then((res) => {
        if (res.status === 200) {
          Alert.success(translate(
            'react.stocklists.clone.success.label',
            'Stock List has been cloned successfully',
          ));
          fireFetchData();
        }
      })
      .finally(() => hideTheSpinner());
  };

  const publishStocklists = (id) => {
    showTheSpinner();
    apiClient.post(`/openboxes/api/stocklists/${id}/publish`)
      .then((res) => {
        if (res.status === 200) {
          Alert.success(translate(
            'react.stocklists.publish.success.label',
            'Stock List has been published successfully',
          ));
          fireFetchData();
        }
      })
      .finally(() => hideTheSpinner());
  };

  const unpublishStocklists = (id) => {
    showTheSpinner();
    apiClient.post(`/openboxes/api/stocklists/${id}/unpublish`)
      .then((res) => {
        if (res.status === 200) {
          Alert.success(translate(
            'react.stocklists.unpublish.success.label',
            'Stock List has been unpublished successfully',
          ));
          fireFetchData();
        }
      })
      .finally(() => hideTheSpinner());
  };

  const onFetchHandler = (state) => {
    const offset = state.page > 0 ? (state.page) * state.pageSize : 0;
    const sortingParams = state.sorted.length > 0 ?
      {
        sort: state.sorted[0].id,
        order: state.sorted[0].desc ? 'desc' : 'asc',
      } : undefined;

    const { isPublished, ...otherFilterParams } = filterParams;
    const params = _.omitBy({
      ...otherFilterParams,
      offset: `${offset}`,
      max: `${state.pageSize}`,
      includeUnpublished: isPublished,
      origin: filterParams.origin && filterParams.origin.map(({ id }) => id),
      destination: filterParams.destination && filterParams.destination.map(({ id }) => id),
      ...sortingParams,
    }, (value) => {
      if (typeof value === 'object' && _.isEmpty(value)) return true;
      return !value;
    });

    // Fetch data
    setLoading(true);
    apiClient.get('/openboxes/api/stocklists', {
      params,
      paramsSerializer: parameters => queryString.stringify(parameters),
    })
      .then((res) => {
        setLoading(false);
        setPages(Math.ceil(res.data.totalCount / state.pageSize));
        setTotalData(res.data.totalCount);
        setTableData(res.data.data);
        // Store currently used params for export case
        setCurrentParams(params);
      });
  };

  // List of all actions for Stocklists rows
  const actions = [
    {
      defaultLabel: 'Show stock list',
      label: 'react.stocklists.show.label',
      leftIcon: <RiInformationLine />,
      href: '/openboxes/requisitionTemplate/show',
    },
    {
      defaultLabel: 'Edit stock list',
      label: 'react.stocklists.editStock.label',
      leftIcon: <RiPencilLine />,
      href: '/openboxes/requisitionTemplate/editHeader',
    },
    {
      defaultLabel: 'Edit stock list items',
      label: 'react.stocklists.items.editStock.label',
      leftIcon: <RiListUnordered />,
      href: '/openboxes/requisitionTemplate/edit',
    },
    {
      defaultLabel: 'Import stock list items',
      label: 'react.stocklists.items.import.label',
      leftIcon: <RiUploadLine />,
      href: '/openboxes/requisitionTemplate/batch',
    },
    {
      defaultLabel: 'Export stock list items',
      label: 'react.stocklists.items.export.label',
      leftIcon: <RiDownloadLine />,
      onClick: exportStockListItems,
    },
    {
      defaultLabel: 'Clone stock list',
      label: 'react.stocklists.clone.label',
      leftIcon: <RiFileCopyLine />,
      onClick: cloneStocklists,
    },
    {
      defaultLabel: 'Publish stock list',
      label: 'react.stocklists.publish.label',
      leftIcon: <RiFile3Line />,
      isPublished: false,
      onClick: publishStocklists,
    },
    {
      defaultLabel: 'Unpublish stock list',
      label: 'react.stocklists.unpubish.label',
      leftIcon: <RiFileForbidLine />,
      isPublished: true,
      onClick: unpublishStocklists,
    },
    {
      defaultLabel: 'Clear stock list items',
      label: 'react.stocklists.items.clear.label',
      leftIcon: <RiEraserLine />,
      variant: 'danger',
      onClick: onClickClearStocklists,
    },
    {
      defaultLabel: 'Delete stock list',
      label: 'react.stocklists.delete.label',
      leftIcon: <RiDeleteBinLine />,
      variant: 'danger',
      onClick: onClickDeleteStocklists,
    },
  ];

  // Columns for react-table
  const columns = [
    {
      Header: ' ',
      width: 50,
      sortable: false,
      style: { overflow: 'visible', zIndex: 1 },
      fixed: 'left',
      Cell: row => (
        <ActionDots
          dropdownPlacement="right"
          dropdownClasses="action-dropdown-offset"
          actions={findActions(actions, row, { customFilter: customActionFilter })}
          id={row.original.id}
        />),
    },
    {
      Header: 'Status',
      accessor: 'isPublished',
      fixed: 'left',
      width: 150,
      Cell: row => (
        <StatusIndicator
          status={row.original.isPublished ? 'Published' : 'Draft'}
          variant={row.original.isPublished ? 'success' : 'danger'}
        />),
    },
    {
      Header: 'Name',
      accessor: 'name',
      fixed: 'left',
      minWidth: 250,
      Cell: row => (
        <a href={`/openboxes/requisitionTemplate/show/${row.original.id}`} >
          {row.original.name}
        </a>),
    },
    {
      Header: 'Origin',
      accessor: 'origin',
      minWidth: 250,
      fixed: 'left',
    },
    {
      Header: 'Destination',
      accessor: 'destination',
      minWidth: 250,
      fixed: 'left',
    },
    {
      Header: 'Requisition items',
      accessor: 'requisitionItemCount',
      sortable: false,
      minWidth: 150,
    },
    {
      Header: 'Requested by',
      accessor: 'requestedBy',
      minWidth: 250,
    },
    {
      Header: 'Created by',
      accessor: 'createdBy',
      minWidth: 250,
    },
    {
      Header: 'Updated by',
      accessor: 'updatedBy',
      minWidth: 250,
    },
    {
      Header: 'Date Created',
      accessor: 'dateCreated',
      width: 150,
    },
    {
      Header: 'Last Updated',
      accessor: 'lastUpdated',
      width: 150,
    },
  ];

  return (
    <div className="list-page-list-section">
      <div className="title-text p-3 d-flex justify-content-between align-items-center">
        <div>
          <Translate id="react.stocklists.label" defaultMessage="Stock Lists" />
          <span className="ml-1">{`(${totalData})`}</span>
        </div>
        <Button
          label="react.default.button.export.label"
          defaultLabel="Export"
          variant="secondary"
          EndIcon={<RiDownload2Line />}
          onClick={exportStockList}
        />
      </div>
      <DataTable
        manual
        sortable
        ref={tableRef}
        columns={columns}
        data={tableData}
        loading={loading}
        defaultPageSize={10}
        pages={pages}
        totalData={totalData}
        onFetchData={onFetchHandler}
        className="mb-1"
        noDataText={translate(
          'react.stocklists.empty.label',
          'No stock lists match the given criteria',
        )}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  translate: translateWithDefaultMessage(getTranslate(state.localize)),
});

const mapDispatchToProps = {
  showSpinner,
  hideSpinner,
};

export default connect(mapStateToProps, mapDispatchToProps)(StockListTable);


StockListTable.propTypes = {
  filterParams: PropTypes.shape({}).isRequired,
  showSpinner: PropTypes.func.isRequired,
  hideSpinner: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};
