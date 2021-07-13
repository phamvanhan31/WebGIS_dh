/******************************************************************************
 *
 * Purpose: selectionManagement
 * Author:  Vincent Mathis, SIRAP
 *
 ******************************************************************************
 *
 * Copyright (c) 2009 SIRAP
 *
 * This is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version. See the COPYING file.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with p.mapper; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 ******************************************************************************/

$.extend(PM.Plugin, 
{
	SelectionManagement: 
	{
		/**
		 * Link: remove from selection
		 */
		obj_results_links: {},
		
		/**
		 * Init function
		 * 
		 * Only init the link(s)
		 */
		init: function() {
			var link = '<div class="selectionManagement_linkImg" ';
			link += 'alt="' + _p('selectionManagement_removeSelected__object') + '" ';
			link += 'title="' + _p('selectionManagement_removeSelected__object') + '" ';
			link += 'onclick="javascript:PM.Plugin.SelectionManagement.removeObjectFromSelection(\'--shpLayer--\',\'--shpIndex--\')"';
			link += '>&nbsp;</div>';
			this.obj_results_links = {"selectionManagement_removeSelected__header": link};
		},
		
		/**
		 * AJAX call to remove an object from selection (by layer and index)
		 */
		removeObjectFromSelection: function (layer, shapeIndex) {
			var url = PM_PLUGIN_LOCATION + "/selectionManagement/x_selectionManagement.php";
			var params = SID;
			params += '&operation=remove_selected';
			params += '&layerName=' + layer;
			params += '&objIndex=' + shapeIndex;
	
			$.ajax({
				url: url,
				dataType: "json",
				type: "POST",
				data: params,
				success: function(response) {
					// Select the objects
					PM.Query.writeQResult(response.queryResult, "dynwin");	
					// Si selection vide
					if (response.needRefresh == 1) {
						PM.Map.clearInfo();
					}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					if (window.console) {
						console.log(errorThrown);
					}
				}	
			});
		},
		
		/**
		 * Add header
		 */
		extendQueryLayersHeaders : function(queryLayers, tplName) {
	        if (queryLayers && tplName != 'iquery') {
		        for (var iLayer = 0 ; iLayer < queryLayers.length ; iLayer++) {
		        	var currentLayer = queryLayers[iLayer];
					// ajout de la nouvelle en-tête dans le tableau
	        		$.each(this.obj_results_links, function(name, value) {
		        		currentLayer.header.push(_p(name));
		        		currentLayer.stdheader.push(_p(name));
	        		});
		        }
	        }
		    return queryLayers;
		},

		/**
		 * Add link to each object
		 */
		extendQueryLayersValues: function(queryLayers, tplName) {
			if (queryLayers && tplName != 'iquery') {
		        for (var iLayer = 0 ; iLayer < queryLayers.length ; iLayer++) {
		        	var currentLayer = queryLayers[iLayer];
		        	
		        	var links = this.obj_results_links;
		        	$.each(currentLayer.values, function(iVal, val) {
		        		var objValues = val;
		        		$.each(links, function(name, link) {
		        			var newlink = link.replace(/--shpLayer--/g, val[0].shplink[0]);
		        			newlink = newlink.replace(/--shpIndex--/g, val[0].shplink[1]);
		        			val.push(newlink);
		        		});
		        	});
		        }
	        }
		    return queryLayers;
		},
		
		/**
		 * remove selection
		 */
		removeSelection: function() {
			var urlreq = PM_PLUGIN_LOCATION + "/selectionManagement/x_selectionManagement.php";
			var params = SID;
			params += "&operation=remove_selection";

			$.ajax({
				url: urlreq,
				dataType: "json",
				type: "POST",
				data: params,
				success: function(response) {
					PM.Map.clearInfo();
				},	
				error: function(response) {
					alert("Echec de la suppression");
				}
			});
			
			// hide selection 
			if ($('#pmQueryContainer').length > 0) {
	            $('#pmQueryContainer .jqmClose').click();
	        }
		},
		
		/**
		 * reload selection
		 */
		reloadSelection: function() {
			var urlreq = PM_PLUGIN_LOCATION + "/selectionManagement/x_selectionManagement.php";
			var params = SID;
			params += "&operation=reload_selection";

			$.ajax({
				url: urlreq,
				dataType: "json",
				type: "POST",
				data: params,
				success: function(response) {
					// select the objects
					PM.Query.writeQResult(response.queryResult, "dynwin");
				},		
				error: function(response) {
					alert(_p("selectionManagement_reloadError"));
				}
			});
		},
		
		/**
		 * Reload application
		 */
		reloadMap: function(remove) {
			var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&zoom_type=zoompoint';
			if (remove) {
				PM.extentSelectedFeatures = null;
			}
			PM.Map.updateMap(mapurl);
		}
	}
});