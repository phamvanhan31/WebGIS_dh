<script type="text/javascript">     
        function openCustomDlg1() {
			var dlgOptions = {
				width: 300, height: 200, left: 400, top: 350,
				resizeable: true,
				newsize: true,
				container: 'pmDlgContainer1',  //if container does not exist, it will be created
				name: 'PopupWindow1'			//any name
			};
			var popupUrl = PM_PLUGIN_LOCATION + '/binh_dlg/binh_dlg.php';
			var params = PM.Form.getFormKVP('get_data_form');  //get the form data for posting, need form ID
			var dlgObject = $('#' + dlgOptions.container + '_MSG');
			if (dlgObject.length < 1) { //if the dialog not existed then create a new one
				var dlg = PM.Dlg.createDnRDlg(dlgOptions,_p('Dialog title1'), popupUrl);
				alert('abc');
			}
			else {
				$.ajax({
					url: popupUrl,
					data: params,
					type: 'POST',
					dataType: 'html',					//return (response) in html format
					success: function(response) {		//when success, populate dialog with response html content
						dlgObject.html(response);
						dlgObject.parent().parent().show();
					}
				});
			}
		}

</script>
<?php
	//create a input box with name "b1" and populate its content when posting
	if(isset($_POST['b1'])){
		$inputbox_html = '<input type="text" name="b1" value="' . $_POST['b1'] . 'added' . '" />';
	}
	else {
		$inputbox_html = '<input type="text" name="b1" />';
	}
?>
<FORM id="get_data_form" NAME="get_data_form" method="post" ACTION="plugins/binh_dlg/binh_dlg.php">
	<? echo($inputbox_html); ?>
	<input type="button" name="subbtn" value="Nhập" onClick="openCustomDlg1()" />
</FORM>