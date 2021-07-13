$.extend(PM.Map,
{
    binh_dlg_click: function() {
		PM.Plugin.binh_dlg.openCustomDlg();
    }
});

$.extend(PM.Plugin,
{
    binh_dlg: 
    {
        openCustomDlg: function() {
			var dlgOptions = {
				width: 300, height: 200, left: 400, top: 350,
				resizeable: true,
				newsize: true,
				container: 'pmDlgContainer1',
				name: 'PopupWindow1'
			};
			var popupUrl = PM_PLUGIN_LOCATION + '/binh_dlg/binh_dlg.php';
			var dlg = PM.Dlg.createDnRDlg(dlgOptions,_p('Dialog title1'), popupUrl);
		}
	}
});