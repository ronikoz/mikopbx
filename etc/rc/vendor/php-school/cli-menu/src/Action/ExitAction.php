<?php
/**
 * Copyright © MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Alexey Portnov, 1 2020
 */

namespace PhpSchool\CliMenu\Action;

use PhpSchool\CliMenu\CliMenu;

/**
 * @author Aydin Hassan <aydin@hotmail.co.uk>
 */
class ExitAction
{
    public function __invoke(CliMenu $menu) : void
    {
        $menu->close();
    }
}
