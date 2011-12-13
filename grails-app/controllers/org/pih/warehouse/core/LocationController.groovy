package org.pih.warehouse.core;

class LocationController {
	
	def inventoryService
	
	/**
	 * Controllers for managing other locations (besides warehouses)
	 */
	
	def list = {
		params.max = Math.min(params.max ? params.int('max') : 25, 100)
		[locationInstanceList: Location.list(params), locationInstanceTotal: Location.count()]
	}
	
	def edit = {
		def locationInstance = inventoryService.getLocation(params.id)
		if (!locationInstance) {
			flash.message = "${warehouse.message(code: 'default.not.found.message', args: [warehouse.message(code: 'location.label', default: 'Location'), params.id])}"
			redirect(action: "list")
		}
		else {
			return [locationInstance: locationInstance]
		}
	}
	
	def update = {
			def locationInstance = inventoryService.getLocation(params.id)
			
			if (locationInstance) {
				if (params.version) {
					def version = params.version.toLong()
					if (locationInstance.version > version) {
						
						locationInstance.errors.rejectValue("version", "default.optimistic.locking.failure", [warehouse.message(code: 'location.label', default: 'Location')] as Object[], "Another user has updated this Location while you were editing")
						render(view: "edit", model: [locationInstance: locationInstance])
						return
					}
				}
				
				locationInstance.properties = params
						
				if (!locationInstance.hasErrors()) {
					inventoryService.saveLocation(locationInstance)
					flash.message = "${warehouse.message(code: 'default.updated.message', args: [warehouse.message(code: 'location.label', default: 'Location'), locationInstance.id])}"
					redirect(action: "list", id: locationInstance.id)
				}
				else {
					render(view: "edit", model: [locationInstance: locationInstance])
				}
			}
			else {
				flash.message = "${warehouse.message(code: 'default.not.found.message', args: [warehouse.message(code: 'location.label', default: 'Location'), params.id])}"
				redirect(action: "list")
			}
		}
	
		def delete = {
			def locationInstance = Location.get(params.id)
	        if (locationInstance) {	        	
		          try {
		            locationInstance.delete(flush: true)
		            
		            flash.message = "${warehouse.message(code: 'default.deleted.message', args: [warehouse.message(code: 'location.label', default: 'Location'), params.id])}"
		            redirect(action: "list")
			      }
			      catch (org.springframework.dao.DataIntegrityViolationException e) {
		            flash.message = "${warehouse.message(code: 'default.not.deleted.message', args: [warehouse.message(code: 'location.label', default: 'Location'), params.id])}"
		            redirect(action: "edit", id: params.id)
			      }
	        }
	        else {
	            flash.message = "${warehouse.message(code: 'default.not.deleted.message', args: [warehouse.message(code: 'location.label', default: 'Location'), params.id])}"
	            redirect(action: "edit", id: params.id)
	        }
		}
		
		
		/**
		* View warehouse logo
		*/
	   def viewLogo = {
		   def warehouseInstance = Location.get(params.id);
		   if (warehouseInstance) {
			   byte[] logo = warehouseInstance.logo
			   if (logo) {
				   response.outputStream << logo
			   }
		   }
	   }
   
   
	   def uploadLogo = {		   
		   def warehouseInstance = Location.get(params.id);
		   if (warehouseInstance) {
			   def logo = request.getFile("logo");
			   if (!logo?.empty && logo.size < 1024*1000) { // not empty AND less than 1MB
				   warehouseInstance.logo = logo.bytes;
				   if (!warehouseInstance.hasErrors()) {
					   inventoryService.save(warehouseInstance)
					   flash.message = "${warehouse.message(code: 'default.updated.message', args: [warehouse.message(code: 'warehouse.label', default: 'Location'), warehouseInstance.id])}"
				   }
				   else {
					   // there were errors, the photo was not saved
				   }
			   }
			   redirect(action: "show", id: warehouseInstance.id)
		   }
		   else {
			   "${warehouse.message(code: 'default.not.found.message', args: [warehouse.message(code: 'warehouse.label', default: 'Location'), params.id])}"
		   }
	   }
	
}
