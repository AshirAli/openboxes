/**
 * Copyright (c) 2012 Partners In Health.  All rights reserved.
 * The use and distribution terms for this software are covered by the
 * Eclipse Public License 1.0 (http://opensource.org/licenses/eclipse-1.0.php)
 * which can be found in the file epl-v10.html at the root of this distribution.
 * By using this software in any fashion, you are agreeing to be bound by
 * the terms of this license.
 * You must not remove this notice, or any other, from this software.
 **/
package org.pih.warehouse.core

import grails.gorm.transactions.Transactional
import org.pih.warehouse.shipping.Shipment

@Transactional
class Doc4jController {

    def documentService

    /**
     *
     */
    def downloadPackingList() {

        def shipmentInstance = Shipment.get(params.id)

        if (!shipmentInstance) {
            throw new Exception("Unable to locate shipment with ID ${params.id}")
        }

        def filename = "Packing List - " + shipmentInstance?.name?.trim() + ".xls"
        log.info("filename " + filename)
        response.setHeader("Content-disposition", "attachment; filename=\"${filename}\"")
        response.setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        documentService.generatePackingList(response.outputStream, shipmentInstance)
        response.outputStream.flush()
        response.outputStream.close()
    }

    def downloadCertificateOfDonation() {

        def shipmentInstance = Shipment.get(params.id)

        if (!shipmentInstance) {
            throw new Exception("Unable to locate shipment with ID ${params.id}")
        }

        def filename = "Certificate of Donation - " + shipmentInstance?.shipmentNumber + ".xls"
        log.info("filename " + filename)
        response.setHeader("Content-disposition", "attachment; filename=\"${filename}\"")
        response.setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        documentService.generateCertificateOfDonation(response.outputStream, shipmentInstance)
        response.outputStream.flush()
        response.outputStream.close()
    }

}
