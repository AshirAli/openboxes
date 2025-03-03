/**
 * Copyright (c) 2012 Partners In Health.  All rights reserved.
 * The use and distribution terms for this software are covered by the
 * Eclipse Public License 1.0 (http://opensource.org/licenses/eclipse-1.0.php)
 * which can be found in the file epl-v10.html at the root of this distribution.
 * By using this software in any fashion, you are agreeing to be bound by
 * the terms of this license.
 * You must not remove this notice, or any other, from this software.
 **/
package org.pih.warehouse.importer

import grails.util.Holders
import org.grails.plugins.excelimport.AbstractExcelImporter
import org.grails.plugins.excelimport.DefaultImportCellCollector
import org.grails.plugins.excelimport.ExcelImportService
import org.grails.plugins.excelimport.ExpectedPropertyType

class InventoryLevelExcelImporter extends AbstractExcelImporter implements DataImporter {

    static cellReporter = new DefaultImportCellCollector()

    ExcelImportService excelImportService

    @Delegate
    InventoryLevelImportDataService inventoryLevelImportDataService

    static Map cellMap = [sheet: 'Sheet1', startRow: 1, cellMap: []]

    static Map columnMap = [
            sheet    : 'Sheet1',
            startRow : 1,
            columnMap: [
                    'A': 'status',
                    'B': 'productCode',
                    'C': 'productName',
                    'D': 'category',
                    'E': 'tags',
                    'F': 'manufacturer',
                    'G': 'manufacturerCode',
                    'H': 'vendor',
                    'I': 'vendorCode',
                    'J': 'preferredBinLocation',
                    'K': 'unitOfMeasure',
                    'L': 'package',
                    'M': 'packageUom',
                    'N': 'packageSize',
                    'O': 'pricePerPackage',
                    'P': 'pricePerUnit',
                    'Q': 'minQuantity',
                    'R': 'reorderQuantity',
                    'S': 'maxQuantity',
                    'T': 'currentQuantity',
                    'U': 'expectedLeadTimeDays',
                    'V': 'replenishmentPeriodDays',
                    'X': 'preferredForReorder'
            ]
    ]

    static Map propertyMap = [
            status              : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            productCode         : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            productName         : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            tags                : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            category            : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            manufacturer        : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            manufacturerCode    : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            vendor              : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            vendorCode          : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            preferredBinLocation: ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            unitOfMeasure       : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            package             : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            packageUom          : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null]),
            packageSize         : ([expectedType: ExpectedPropertyType.IntType, defaultValue: null]),
            pricePerPackage     : ([expectedType: ExpectedPropertyType.IntType, defaultValue: null]),
            pricePerUnit        : ([expectedType: ExpectedPropertyType.IntType, defaultValue: null]),
            minQuantity         : ([expectedType: ExpectedPropertyType.IntType, defaultValue: null]),
            reorderQuantity     : ([expectedType: ExpectedPropertyType.IntType, defaultValue: null]),
            maxQuantity         : ([expectedType: ExpectedPropertyType.IntType, defaultValue: null]),
            currentQuantity     : ([expectedType: ExpectedPropertyType.IntType, defaultValue: null]),
            expectedLeadTimeDays : ([expectedType: ExpectedPropertyType.IntType, defaultValue: null]),
            replenishmentPeriodDays : ([expectedType: ExpectedPropertyType.IntType, defaultValue: null]),
            preferredForReorder : ([expectedType: ExpectedPropertyType.StringType, defaultValue: null])
    ]


    InventoryLevelExcelImporter(String fileName) {
        super()
        read(fileName)
        excelImportService = Holders.grailsApplication.mainContext.getBean("excelImportService")
        inventoryLevelImportDataService = Holders.grailsApplication.mainContext.getBean("inventoryLevelImportDataService")
    }


    List<Map> getData() {
        excelImportService.columns(
                workbook,
                columnMap,
                cellReporter,
                propertyMap
        )
    }
}
