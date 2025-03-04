/**
 * Copyright (c) 2012 Partners In Health.  All rights reserved.
 * The use and distribution terms for this software are covered by the
 * Eclipse Public License 1.0 (http://opensource.org/licenses/eclipse-1.0.php)
 * which can be found in the file epl-v10.html at the root of this distribution.
 * By using this software in any fashion, you are agreeing to be bound by
 * the terms of this license.
 * You must not remove this notice, or any other, from this software.
 **/
package org.pih.warehouse.api

import grails.plugins.csv.CSVWriter
import grails.converters.JSON
import org.grails.web.json.JSONObject
import org.pih.warehouse.core.Location
import org.pih.warehouse.importer.ImportDataCommand
import org.pih.warehouse.order.Order
import org.pih.warehouse.order.OrderItem
import org.pih.warehouse.order.OrderItemStatusCode
import org.pih.warehouse.product.Product
import org.pih.warehouse.shipping.Shipment
import org.pih.warehouse.shipping.ShipmentItem
import javax.xml.bind.ValidationException
import org.apache.commons.lang.StringEscapeUtils

class CombinedShipmentItemApiController {

    def orderService
    def combinedShipmentService

    def getProductsInOrders() {
        def minLength = grailsApplication.config.openboxes.typeahead.minLength
        def vendor = Location.get(params.vendor)
        def destination = Location.get(params.destination)
        String[] terms = params?.name?.split(",| ")?.findAll { it }
        if (params.name && params.name.size() < minLength) {
            render([data: []])
            return
        }
        def orderItems = orderService.getProductsInOrders(terms, destination, vendor)
        def products = orderItems.findAll{ it.getQuantityRemainingToShip() > 0 }.flatten().toArray().collect { it.product }.unique()

        render([data: products] as JSON)
    }

    def getOrderOptions() {
        def vendor = Location.get(params.vendor)
        def destination = Location.get(params.destination)
        List<Order> orders = orderService.getOrdersForCombinedShipment(vendor, destination)
        render([data: orders
                .findAll{it.orderItems.any { item -> (item.getQuantityRemainingToShip() > 0) && !item.canceled }}
                .collect {
                    [
                        id: it.id,
                        orderNumber: it.orderNumber
                    ]
                }
        ] as JSON)
    }

    def findOrderItems() {
        List<Order> orders
        if (request.JSON.orderIds) {
            orders = Order.findAllByIdInList(request.JSON.orderIds)
        } else {
            def vendor = Location.get(request.JSON.vendor)
            def destination = Location.get(request.JSON.destination)
            orders = orderService.getOrdersForCombinedShipment(vendor, destination)
        }
        Product product = Product.get(request.JSON.productId)

        List<OrderItem> orderItems = []

        if (orders) {
            orderItems = product
                    ? OrderItem.findAllByOrderInListAndProduct(orders, product)
                    : OrderItem.findAllByOrderInList(orders)
        }

        render([orderItems: orderItems.findAll{ it.orderItemStatusCode != OrderItemStatusCode.CANCELED && it.getQuantityRemainingToShip() > 0 }.collect {
            [
                orderId: it.order.id,
                orderItemId: it.id,
                orderNumber: it.order?.orderNumber,
                productCode: it.product?.productCode,
                productName: it.product?.name,
                displayName: it.product?.displayName,
                budgetCode: it.budgetCode?.code,
                recipient: it.recipient?.name,
                quantityAvailable: it.getQuantityRemainingToShip(),
                quantityToShip: '',
                uom: it.unitOfMeasure,
                supplierCode: it.productSupplier?.supplierCode,
                color: it.product?.color,
            ]
        }] as JSON)
    }

    def addItemsToShipment() {
        Shipment shipment = Shipment.get(params.id)
        List itemsToAdd = request.JSON.itemsToAdd
        if (!shipment) {
            render(status: 400, text: "Shipment not found")
            return
        }
        combinedShipmentService.saveItemsToShipment(shipment, itemsToAdd)
        render([data: shipment] as JSON)
    }

    def importTemplate(ImportDataCommand command) {
        combinedShipmentService.importTemplate(command, params.id)
        render (status: 200, text: "Successfully imported template")
    }

    def exportTemplate() {
        def sw = new StringWriter()

        def csv = new CSVWriter(sw, {
            "Order number" { it.orderNumber }
            "Order Item id" { it.id }
            "Product code" { it.productCode }
            "Product name" { it.productName }
            "Lot number" { it.lotNumber }
            "Expiry" { it.expiry }
            "Quantity to ship" { it.quantityToShip }
            "UOM" { it.unitOfMeasure }
            "Pack level 1" { it.palletName }
            "Pack level 2" { it.boxName }
            "Recipient" { it.recipient }
            "Budget code" { it.budgetCode }
            "Supplier code" { it.supplierCode }
        })

        if (params.blank) {
            csv << [
                orderNumber     : "",
                id              : "",
                productCode     : "",
                productName     : "",
                lotNumber       : "",
                expiry          : "",
                quantityToShip  : "",
                unitOfMeasure   : "",
                palletName      : "",
                boxName         : "",
                recipient       : "",
                budgetCode      : "",
                supplierCode    : "",
            ]
        } else {
            def vendor = Location.get(params.vendor)
            def destination = Location.get(params.destination)
            def orders = orderService.getOrdersForCombinedShipment(vendor, destination)
            def orderItems = OrderItem.findAllByOrderInList(orders)
            orderItems
                .findAll{ it.orderItemStatusCode != OrderItemStatusCode.CANCELED && it.getQuantityRemainingToShip() > 0 }
                .each {orderItem ->
                    String quantityUom = "${orderItem?.quantityUom?.code?:g.message(code:'default.ea.label')?.toUpperCase()}"
                    Integer quantityPerUom = orderItem?.quantityPerUom?.toInteger() ?: 1
                    String unitOfMeasure = "${quantityUom}/${quantityPerUom}"
                    csv << [
                            orderNumber         : orderItem.order.orderNumber,
                            id                  : orderItem.id,
                            productCode         : orderItem.product.productCode,
                            productName         : orderItem.product.name,
                            lotNumber           : '',
                            expiry              : '',
                            quantityToShip      : orderItem.getQuantityRemainingToShip(),
                            unitOfMeasure       : unitOfMeasure,
                            palletName          : '',
                            boxName             : '',
                            recipient           : orderItem.recipient ?: '',
                            budgetCode          : StringEscapeUtils.escapeCsv(orderItem.budgetCode?.code) ?: '',
                            supplierCode        : orderItem?.productSupplier?.supplierCode ?: '',
                    ]
            }
        }

        response.setHeader("Content-disposition", "attachment; filename=\"Order-items-template.csv\"")
        render(contentType: "text/csv", text: sw.toString(), encoding: "UTF-8")
        return
    }
}
