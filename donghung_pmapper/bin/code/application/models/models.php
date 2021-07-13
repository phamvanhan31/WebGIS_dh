<?php
    class models extends CI_Model{
        public function __construct()
        {
            $this->load->database();
        }
        public function get_diemquantrac($qtname = '')
        {
            $params = array();   
            $sql = 'SELECT * FROM qn_diemquantrac WHERE ten=?';  
			$params['ten'] = $qtname;
            $query = $this->db->query($sql,$params);
            return $query->result_array();			
        }
    }
?>