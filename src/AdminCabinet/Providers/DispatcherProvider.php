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

declare(strict_types=1);

namespace MikoPBX\AdminCabinet\Providers;


use MikoPBX\AdminCabinet\{Plugins\CacheCleanerPlugin,
    Plugins\NormalizeControllerNamePlugin,
    Plugins\NotFoundPlugin,
    Plugins\SecurityPlugin};
use Phalcon\Di\DiInterface;
use Phalcon\Di\ServiceProviderInterface;
use Phalcon\Events\Manager as EventsManager;
use Phalcon\Mvc\Dispatcher;
use Whoops\Handler\PrettyPageHandler;

/**
 *  We register the events manager
 */
class DispatcherProvider implements ServiceProviderInterface
{
    public const SERVICE_NAME = 'dispatcher';

    /**
     * Register dispatcher service provider
     *
     * @param \Phalcon\Di\DiInterface $di
     */
    public function register(DiInterface $di): void
    {
        $di->setShared(
            self::SERVICE_NAME,
            function () {
                $eventsManager = new EventsManager();


                /**
                 * FrontEnd cache cleaner plugin
                 */
                $eventsManager->attach('dispatch:beforeDispatch', new CacheCleanerPlugin());

                /**
                 * Camelize Controller name
                 */
                $eventsManager->attach('dispatch:beforeDispatch', new NormalizeControllerNamePlugin());
                $eventsManager->attach('dispatch:afterDispatchLoop', new NormalizeControllerNamePlugin());

                /**
                 * Check if the user is allowed to access certain action using the SecurityPlugin
                 */
                $eventsManager->attach('dispatch:beforeDispatch', new SecurityPlugin());

                /**
                 * Handle exceptions and not-found exceptions using NotFoundPlugin
                 */
                if (! class_exists(PrettyPageHandler::class)) {
                    $eventsManager->attach(
                        'dispatch:beforeException',
                        new NotFoundPlugin()
                    );
                }
                $dispatcher = new Dispatcher();
                $dispatcher->setEventsManager($eventsManager);

                return $dispatcher;
            }
        );
    }
}
