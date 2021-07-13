<?php

/******************************************************************************
 *
 * Purpose: Easy MDB2 use
 * Author:  Thomas Raffin, SIRAP
 *
 ******************************************************************************
 *
 * Copyright (c) 2008 SIRAP
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

require_once("MDB2.php");

class Easy_MDB2 {
    /**
	 * DSN configuration
	 */
	private $dsn;
	private $charset;

	private $db;
	protected $dbh;
	
	private $reverseMode;
	private $managerMode;
	
	
	public function __construct() {
		$this->dsn = "";
		$this->charset = false;
        $this->db = null;
        $this->dbh = null;
        $this->reverseMode = false;
        $this->managerMode = false;
	}
	
	private function setReverseModeON() {
		if (!$this->reverseMode) {
			$this->dbh->loadModule('Reverse', null, true);
			$this->reverseMode = true;
		}
	}
	
	private function setManagerModeON() {
		if (!$this->managerMode) {
			$this->dbh->loadModule('Manager', null, true);
			$this->managerMode = true;
		}
	}
	
	public function db_start() {
	}

	public function setCharset($charset) {
		$this->charset = $charset;
	}
	
	public function setDSN($dsn) {
		$this->dsn = $dsn;
	}
	
	public function start() {
    	$ok = false;
    	if (!$this->db) {
			$this->db = new MDB2;
		}
		if ($this->db) {
	    	if (!$this->dbh) {
		    	$this->dbh = $this->db->connect($this->dsn);
				if (!$this->db->isError($this->dbh)) {
					$this->dbh->setFetchMode(MDB2_FETCHMODE_ASSOC);
					$this->dbh->loadModule('Extended');
					if ($this->charset) {
						$this->dbh->setCharset($this->charset);
					}
					$ok = true;
				} else {
					pm_logDebug(0, "ERROR - Easy_MDB2 - DB connection: \n" . $this->dbh->getMessage());
					$this->dbh = null;
				}
	    	} else {
	    		$ok = true;
	    	}
		}
		return $ok;
	}
		
	public function end($terminateCurrentLog = false) {
		if ($this->dbh) {
			$this->dbh->disconnect();
			pm_logDebug(4, "MSG - Easy_MDB2 - DB disconnection\n");
		} 
	}
	
	public function quoteval($val, $type) {
		return $this->dbh->quote($val, $type);
	}
	
	public function selectByQuery($sqlQuery, $msg, $orderBy = '', $limit = 0, $offset = 0) {
		$ret = Array();

		if ($this->dbh) {
			if ($orderBy) {
				if (!stripos("ORDER BY", $sqlQuery)) {
					$sqlQuery .= " ORDER BY " . $orderBy;
				}
			}

			if ( ($limit > 0) || ($offset > 0) ) {
				$this->dbh->setLimit($limit, $offset);
			}

			$res = $this->dbh->query($sqlQuery);
			if ($this->db->isError($res)) {
				pm_logDebug(0, "ERROR - Easy_MDB2 (SELECT) - $msg: \n" . $res->getMessage());
			} else {
				pm_logDebug(4, "MSG - Easy_MDB2 - (SELECT OK) - $msg\n");
/*
				if ($row = $res->fetchRow()) {
					$keys = array_keys($row);
					$ret["header"] = $keys;
					$ret["values"][] = $row;
				}
				while ($row = $res->fetchRow()) {
				$ret["values"][] = $row;
				}
*/
				$ret["header"] = $res->getColumnNames(true);
				$ret["values"] = Array();
				while($row = $res->fetchRow()) {
					$ret["values"][] = $row;
				}

				$res->free();
			}
		}

		return $ret;
	}

}


?>