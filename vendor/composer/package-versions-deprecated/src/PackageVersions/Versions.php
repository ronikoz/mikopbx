<?php

declare(strict_types=1);

namespace PackageVersions;

use OutOfBoundsException;

/**
 * This class is generated by composer/package-versions-deprecated, specifically by
 * @see \PackageVersions\Installer
 *
 * This file is overwritten at every run of `composer install` or `composer update`.
 */
final class Versions
{
    const ROOT_PACKAGE_NAME = 'mikopbx/core';
    /**
     * Array of all available composer packages.
     * Dont read this array from your calling code, but use the \PackageVersions\Versions::getVersion() method instead.
     *
     * @var array<string, string>
     * @internal
     */
    const VERSIONS          = array (
  'beberlei/assert' => 'v3.2.7@d63a6943fc4fd1a2aedb65994e3548715105abcf',
  'clue/stream-filter' => 'v1.4.1@5a58cc30a8bd6a4eb8f856adf61dd3e013f53f71',
  'composer/package-versions-deprecated' => '1.8.0@98df7f1b293c0550bd5b1ce6b60b59bdda23aa47',
  'filp/whoops' => '2.7.2@17d0d3f266c8f925ebd035cd36f83cf802b47d4a',
  'guzzlehttp/guzzle' => '6.5.3@aab4ebd862aa7d04f01a4b51849d657db56d882e',
  'guzzlehttp/promises' => 'v1.3.1@a59da6cf61d80060647ff4d3eb2c03a2bc694646',
  'guzzlehttp/psr7' => '1.6.1@239400de7a173fe9901b9ac7c06497751f00727a',
  'http-interop/http-factory-guzzle' => '1.0.0@34861658efb9899a6618cef03de46e2a52c80fc0',
  'icecave/repr' => '2.0.1@87b7de87d0323c6ab99116bac3e66c4522c06be0',
  'ircmaxell/random-lib' => 'v1.2.0@e9e0204f40e49fa4419946c677eccd3fa25b8cf4',
  'ircmaxell/security-lib' => 'v1.1.0@f3db6de12c20c9bcd1aa3db4353a1bbe0e44e1b5',
  'jean85/pretty-package-versions' => '1.3.0@e3517fb11b67e798239354fe8213927d012ad8f9',
  'paragonie/random_compat' => 'v9.99.99@84b4dfb120c6f9b4ff7b3685f9b8f1aa365a0c95',
  'pda/pheanstalk' => 'v4.0.1@41212671020de91086ace9e6181e69829466f087',
  'php-http/client-common' => '2.1.0@a8b29678d61556f45d6236b1667db16d998ceec5',
  'php-http/discovery' => '1.7.4@82dbef649ccffd8e4f22e1953c3a5265992b83c0',
  'php-http/guzzle6-adapter' => 'v2.0.1@6074a4b1f4d5c21061b70bab3b8ad484282fe31f',
  'php-http/httplug' => '2.1.0@72d2b129a48f0490d55b7f89be0d6aa0597ffb06',
  'php-http/message' => '1.8.0@ce8f43ac1e294b54aabf5808515c3554a19c1e1c',
  'php-http/message-factory' => 'v1.0.2@a478cb11f66a6ac48d8954216cfed9aa06a501a1',
  'php-http/promise' => 'v1.0.0@dc494cdc9d7160b9a09bd5573272195242ce7980',
  'php-school/cli-menu' => '4.0.0@8354cc4ca0d36f6b1dcc2d54fafe38157f58d45f',
  'php-school/terminal' => '0.2.1@725f86c7db996a4cf65648022f17e22391e97320',
  'phpmailer/phpmailer' => 'v6.1.5@a8bf068f64a580302026e484ee29511f661b2ad3',
  'psr/http-client' => '1.0.0@496a823ef742b632934724bf769560c2a5c7c44e',
  'psr/http-factory' => '1.0.1@12ac7fcd07e5b077433f5f2bee95b3a771bf61be',
  'psr/http-message' => '1.0.1@f6561bf28d520154e4b0ec72be95418abe6d9363',
  'psr/log' => '1.1.3@0f73288fd15629204f9d42b7055f72dacbe811fc',
  'ralouphie/getallheaders' => '3.0.3@120b605dfeb996808c31b6477290a714d356e822',
  'react/event-loop' => 'v1.1.1@6d24de090cd59cfc830263cfba965be77b563c13',
  'react/promise' => 'v2.8.0@f3cff96a19736714524ca0dd1d4130de73dbbbc4',
  'recoil/api' => '1.0.1@0e998e56ca1b6ddf8665b23833737445ab639b4e',
  'recoil/kernel' => '1.0.2@cf307c4f8de2b82dfd3798b1bdd1d2c229239b3a',
  'recoil/react' => '1.0.2@d385ab9ff8cbc99ab2d145ff9687895f9e8dcc0d',
  'recoil/recoil' => '1.0.1@4b6ef1bac619910b21edb3bda6a7b16502b6889a',
  'repejota/nats' => '0.8.4@e1031b58114cbc009c5dabd894f12bcbd39cf6f8',
  'sentry/sdk' => '2.1.0@18921af9c2777517ef9fb480845c22a98554d6af',
  'sentry/sentry' => '2.3.2@b3e71feb32f1787b66a3b4fdb8686972e9c7ba94',
  'symfony/options-resolver' => 'v5.0.8@3707e3caeff2b797c0bfaadd5eba723dd44e6bf1',
  'symfony/polyfill-intl-idn' => 'v1.17.0@3bff59ea7047e925be6b7f2059d60af31bb46d6a',
  'symfony/polyfill-mbstring' => 'v1.17.0@fa79b11539418b02fc5e1897267673ba2c19419c',
  'symfony/polyfill-php72' => 'v1.17.0@f048e612a3905f34931127360bdd2def19a5e582',
  'symfony/polyfill-uuid' => 'v1.17.0@6dbf0269e8aeab8253a5059c51c1760fb4034e87',
  'mikopbx/core' => 'dev-develop@6c2a473d8836921a85de150d6f862e64553d670b',
);

    private function __construct()
    {
    }

    /**
     * @throws OutOfBoundsException If a version cannot be located.
     *
     * @psalm-param key-of<self::VERSIONS> $packageName
     * @psalm-pure
     */
    public static function getVersion(string $packageName) : string
    {
        if (isset(self::VERSIONS[$packageName])) {
            return self::VERSIONS[$packageName];
        }

        throw new OutOfBoundsException(
            'Required package "' . $packageName . '" is not installed: check your ./vendor/composer/installed.json and/or ./composer.lock files'
        );
    }
}
