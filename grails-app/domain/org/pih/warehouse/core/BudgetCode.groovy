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

import org.pih.warehouse.auth.AuthService

class BudgetCode implements Serializable {

    def beforeInsert() {
        createdBy = AuthService.currentUser
        updatedBy = AuthService.currentUser
    }

    def beforeUpdate() {
        updatedBy = AuthService.currentUser
    }

    String id
    String code
    String name
    String description
    Boolean active = true       // by default = true

    Organization organization

    // Audit fields
    Date dateCreated
    Date lastUpdated
    User createdBy
    User updatedBy

    static mapping = {
        id generator: 'uuid'
        version false
    }

    static constraints = {
        code(nullable: false, blank: false, unique: true)
        organization(nullable: true)
        name(nullable: true)
        description(nullable: true)
        updatedBy(nullable: true)
        createdBy(nullable: true)
        active(nullable: true)
    }
}
