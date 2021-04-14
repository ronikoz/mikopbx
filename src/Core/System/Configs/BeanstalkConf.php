<?php
/*
 * MikoPBX - free phone system for small business
 * Copyright (C) 2017-2020 Alexey Portnov and Nikolay Beketov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

namespace MikoPBX\Core\System\Configs;


use MikoPBX\Core\System\Util;
use MikoPBX\Core\System\Processes;
use Phalcon\Di\Injectable;

class BeanstalkConf extends Injectable
{
    public const PROC_NAME='beanstalkd';

    /**
     * Restarts Beanstalk server
     */
    public function reStart(): void
    {
        if (Util::isSystemctl()) {
            $systemCtrlPath = Util::which('systemctl');
            Processes::mwExec("{$systemCtrlPath} restart beanstalkd.service");
        } else {
            $config = $this->getDI()->get('config')->beanstalk;
            $conf = "-l {$config->host} -p {$config->port} -z 524280";
            Processes::safeStartDaemon($this::PROC_NAME, $conf);
        }
    }
}