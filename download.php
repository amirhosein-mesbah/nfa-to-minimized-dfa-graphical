<?PHP
	header("Pragma: public");
    header("Expires: 0");
    header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
    header("Cache-Control: public");
    header("Content-Description: File Transfer");
    header("Content-type: application/octet-stream");
    header("Content-Disposition: attachment; filename=\"data.json\"");
    header("Content-Transfer-Encoding: binary");
    ob_end_flush();
    echo $_POST['data'];
?>