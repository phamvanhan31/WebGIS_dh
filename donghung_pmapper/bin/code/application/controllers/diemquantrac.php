<?php
class diemquantrac extends CI_Controller{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('models');
    }
    public function index()
    {
        $data['title']='Hệ thống thông tin chất thải công nghiệp Quảng Ninh';
        
        $this->load->view('templates/header.php', $data);
        $this->load->view('templates/footer.php');
    }
    public function edit_data($qtname)
    {
        $data['diemquantrac'] = $this->models->get_diemquantrac($qtname);
        $data['title']='Hệ thống thông tin chất thải công nghiệp Quảng Ninh';
        $this->load->view('templates/header.php', $data);
        $this->load->view('diemquantrac/edit_data.php', $data);
        $this->load->view('templates/footer.php');
    }	
}
?>