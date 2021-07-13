$.extend(PM.Map,
{
    binh_review_feedback_start: function(imgxy) {
		PM.Plugin.binh_review_feedback.openFeedbackDlg(imgxy);
    },
	
	binh_review_feedback_click: function() {
		PM.Map.mode = 'binh_review_feedback';
		PM.Map.maction = 'click';
		PM.Map.tool = 'binh_review_feedback';
		// define the cursor
		if (PM.useCustomCursor) {
			PM.setCursor(false, 'crosshair');
		}
    }
});

$.extend(PM.Plugin,
{
    binh_review_feedback: 
    {
        openFeedbackDlg: function(imgxy) {
			var dlgOptions = {
				width: 500, height: 400, left: 200, top: 150,
				resizeable: true,
				newsize: false,
				container: 'pmDlgContainer1',
				name: 'PopupWindow1'
			};
			var pixccoords = imgxy.split('+');
            var pixX = pixccoords[0];
            var pixY = pixccoords[1];
            var mpoint = PM.ZoomBox.getGeoCoords(pixX, pixY, false);
			var params = '?&x_coord=' + mpoint.x + '&y_coord=' + mpoint.y;
			
			var popupUrl = PM_PLUGIN_LOCATION + '/binh_review_feedback/binh_review_feedback.php'+params;
			var dlg = PM.Dlg.createDnRDlg(dlgOptions,_p('review_feedback'), popupUrl);
		}
	}
});