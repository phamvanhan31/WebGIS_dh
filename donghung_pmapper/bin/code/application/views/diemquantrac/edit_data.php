<?php
function set_value($mode,$query_result,$field_name)
{
    if($mode='UpdateMode' and isset($query_result[0])) {
        return $query_result[0][$field_name];
    }
    else {
        return '';
    }
}
?>

<script>
function closeWin()
{
	window.close();
}
</script>

<FORM name="edit_form" method="post" action="edit_data">
<table style="position: relative;left:3px; line-height: 160%">
    <tr>
        <td width="540px" style="color: #c02000">
            <fieldset class="control_fieldset">
                <legend style="color: #c02000">&nbspCập nhật thông tin điểm quan trắc:&nbsp</legend>
                <label id="lb_id" for="e_id">Mã số: </label><input id="e_id" size="5" value="<? echo $diemquantrac[0]['gid'];?>"/> 
				<label id="lb_ten" for="e_ten">Tên điểm: </label><input id="e_ten" size="8" value="<? echo $diemquantrac[0]['ten'];?>"/> <br />
				<label id="lb_thongso1" for="e_thongso1">Thông số 1: </label><input id="e_thongso1" size="5" value="<? echo $diemquantrac[0]['thongso1'];?>"/>
				<label id="lb_thongso2" for="e_thongso2">Thông số 2: </label><input id="e_thongso2" size="5" value="<? echo $diemquantrac[0]['thongso2'];?>"/>
				<label id="lb_thoidiem" for="e_thoidiem">Thời điểm: </label><input id="e_thoidiem" size="8" value="<? echo $diemquantrac[0]['thoidiem'];?>"/>
            </fieldset>
        </td>

    </tr>
	<tr style="text-align:center">
		<td>
			<input type="submit" value="Cập nhật" />
			<input type="button" value="Hủy" onClick="closeWin()" />
		</td>	
	</tr>
</table>    

</FORM>