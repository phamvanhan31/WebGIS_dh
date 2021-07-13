<?php
//The purpose of this file is to store temporary codes to be pass to other files during development process

//print out to file value of variable $ToBeOutput
$fp = fopen("binh_log2.txt", "a"); fputs($fp, $ToBeOutput . "------\r\n"); fclose($fp);

$fp = fopen("binh_log2.txt", "w"); fputs($fp, $ToBeOutput . "------\r\n"); fclose($fp);

list($point_lon, $point_lat) = $db->query($sql)->fetchRow(DB_FETCHMODE_ORDERED); //point mode, single lat/lon coordinates


                        <input type="checkbox" name="hien_thi[]"  value="group_id"/>Mã nhóm &nbsp;
                        <input type="checkbox" name="hien_thi[]" value="thong_so_kt"/>Thông số KT &nbsp;
                        <input type="checkbox" name="hien_thi[]" checked value="ten_hieu_dv"/>Đơn vị &nbsp;
                        <input type="checkbox" name="hien_thi[]" checked value="dia_diem"/>Địa điểm đặt &nbsp;
                        <input type="checkbox" name="hien_thi[]" checked value="can_bo_ql" />Cán bộ QL &nbsp;
                        <input type="checkbox" name="hien_thi[]" checked value="gia"/>Giá &nbsp;
                        <input type="checkbox" name="hien_thi[]" checked value="tien_ngoai_ns"/>Tiền ngoài NS &nbsp;
                        <input type="checkbox" name="hien_thi[]" checked value="nuoc_sx"/>Xuất xứ &nbsp;
                        <input type="checkbox" name="hien_thi[]" checked value="so_luong"/>Số lượng &nbsp;
                        <input type="checkbox" name="hien_thi[]" checked value="thoi_han_tl"/>Thời hạn thanh lý &nbsp;
                        <input type="checkbox" name="hien_thi[]" checked value="tinh_trang_hd"/>Tình trạng HĐ &nbsp;
                        <input type="checkbox" name="hien_thi[]" value="qd_thanh_ly"/>QĐ thanh lý &nbsp;
                        <input type="checkbox" name="hien_thi[]" value="nam_thanhly" />Năm thanh lý &nbsp;
                        <input type="checkbox" name="hien_thi[]" value="ghi_chu" />Ghi chú &nbsp;
                        <input type="checkbox" name="hien_thi[]" value="phong_ql"/>Phòng QL &nbsp;
                        
                        
                <th scope="col" class="rounded-left" width="30"><b>Mã số</b></th>
                <th scope="col" class="rounded-q1" width="200"><b>Tên tài sản</b></th>
                <th scope="col" class="rounded-q1" width="30"><b>Số lượng</b></th>
                <th scope="col" class="rounded-q1" width="30"><b>Năm SD</b></th>
                <th scope="col" class="rounded-q1" width="70"><b>Tổng giá</b></th>
                <th scope="col" class="rounded-q1" width="100"><b>Đơn vị</b></th>
                <th scope="col" class="rounded-q1" width="80"><b>Địa điểm đặt</b></th>
                <th scope="col" class="rounded-q1" width="150"><b>Cán bộ quản lý</b></th>
                <th scope="col" class="rounded-q1" width="100"><b>QĐ thanh lý</b></th>
                <th scope="col" class="rounded-right" width="150"><b>Ghi chú</b></th>
                
                
                
                        //else {echo '<tr bgcolor="#FFFFC0">';} ?> 
            <tr>
                <td><a href="edit_data/<?php echo $bc1a_item['id'] ?>" class="edit_trigger"><?php echo $bc1a_item['id'] ?></a></td>
                <td><?php echo $bc1a_item['ten_ts'] ?></td>
                <td><?php echo $bc1a_item['so_luong'] ?></td>
                <td><?php echo $bc1a_item['nam_sd'] ?></td>
                <td align ="right"><?php echo number_format(round($bc1a_item['gia'])/1000000,6,'.','') ?></td>
                <td><?php echo $bc1a_item['ten_hieu_dv'] ?></td>
                <td><?php echo $bc1a_item['dia_diem'] ?></td>
                <td><?php echo $bc1a_item['can_bo_ql'] ?></td>
                <td><?php echo $bc1a_item['qd_thanhly'] ?></td>
                <?php $ghichu=$bc1a_item['ghi_chu']; if(mb_strlen($ghichu)>20){ echo('<td><small>' . $ghichu . '</small></td>');}
                        else {echo('<td>' . $ghichu . '</td>');} ?>
            </tr>  
        <?php endforeach ?>
        
        
        
        
        $route['auth/register']='auth/register';
$route['auth/reset_password']='auth/reset_password';
$route['auth/change_password']='auth/change_password';
$route['auth/change_email']='auth/change_email';
$route['auth/reset_email']='auth/reset_email';
$route['auth/unregister']='auth/unregister';
$route['auth/activate']='auth/activate';
$route['auth/send_again']='auth/send_again';
$route['auth/forgot_password']='auth/forgot_password';
$route['auth']='auth/index';
        
        tank auth: user: tqbinh pass: binh
        
        
        |alpha_dash
        
        
                    <b><font  color="red">  
                        <? echo(count($query_result));?> đầu mục,   
                        <? $total =0; foreach  ($query_result as $item) {$total +=$item['so_luong'];} echo($total); ?> thiết bị,   tổng giá:
                        <? $stotal =0; foreach  ($query_result as $item) {$stotal +=$item['gia'];} echo(round($stotal)/1000000); ?> triệu VND 
                     </font></b>.        
        
        
        
        
        
        
<style>
    #menu {height:auto;}
    #menu li {display:inline; width: 100px;position:relative}
    #menu li.sub { width: 100px;float:none;}
</style>        
            <div style="font-size:12px;">
            <ul id="menu">
                <li><a href="#">Menu1</a></li>
                <li><a href="#">Menu2</a>
                    <ul>
                        <li class="sub"><a href="#">Submenu 2.1</a> </li>
                        <li class="sub"><a href="#">Submenu 2.2</a></li>
                    </ul>
                </li>
                <li><a href="#">Menu3</a></li>
            </ul>
        </div>
<br/><br/><br/><br/>        

        <script>
        $( "#menu" ).menu();
        </script>
        
        
        

?>