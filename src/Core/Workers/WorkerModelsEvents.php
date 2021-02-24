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

namespace MikoPBX\Core\Workers;

require_once 'Globals.php';

use MikoPBX\Common\Models\{AsteriskManagerUsers,
    CallQueueMembers,
    CallQueues,
    Codecs,
    ConferenceRooms,
    CustomFiles,
    DialplanApplications,
    ExtensionForwardingRights,
    Extensions,
    ExternalPhones,
    Fail2BanRules,
    FirewallRules,
    Iax,
    IncomingRoutingTable,
    IvrMenu,
    IvrMenuActions,
    LanInterfaces,
    NetworkFilters,
    OutgoingRoutingTable,
    OutWorkTimes,
    PbxExtensionModules,
    PbxSettings,
    Sip,
    SipHosts,
    SoundFiles,
    Users
};
use MikoPBX\Common\Providers\BeanstalkConnectionModelsProvider;
use MikoPBX\Common\Providers\ModulesDBConnectionsProvider;
use MikoPBX\Common\Providers\PBXConfModulesProvider;
use MikoPBX\Core\Asterisk\Configs\QueueConf;
use MikoPBX\Core\System\{BeanstalkClient,
    Configs\CronConf,
    Configs\Fail2BanConf,
    Configs\IptablesConf,
    Configs\NatsConf,
    Configs\NginxConf,
    Configs\NTPConf,
    Configs\PHPConf,
    Configs\SSHConf,
    Configs\SyslogConf,
    PBX,
    Processes,
    System,
    Util
};
use MikoPBX\Modules\Config\ConfigClass;
use MikoPBX\PBXCoreREST\Workers\WorkerApiCommands;
use Phalcon\Di;
use Pheanstalk\Contract\PheanstalkInterface;

ini_set('error_reporting', E_ALL);
ini_set('display_startup_errors', 1);

class WorkerModelsEvents extends WorkerBase
{
    private const R_MANAGERS = 'reloadManager';

    public const R_NEED_RESTART = 'needRestart';

    private const R_QUEUES = 'reloadQueues';

    private const R_DIALPLAN = 'reloadDialplan';

    private const R_CUSTOM_F = 'updateCustomFiles';

    private const R_FIREWALL = 'reloadFirewall';

    private const R_NETWORK = 'networkReload';

    private const R_IAX = 'reloadIax';

    private const R_SIP = 'reloadSip';

    private const R_FEATURES = 'reloadFeatures';

    private const R_CRON = 'reloadCron';

    public const  R_NGINX = 'reloadNginx';

    public const  R_NGINX_CONF = 'reloadNginxConf';

    public const  R_FAIL2BAN_CONF = 'reloadFail2BanConf';

    private const R_PHP_FPM = 'reloadPHPFPM';

    private const R_TIMEZONE = 'updateTomeZone';

    private const R_SYSLOG = 'restartSyslogD';

    private const R_SSH = 'reloadSSH';

    private const R_LICENSE = 'reloadLicense';

    private const R_NATS = 'reloadNats';

    private const R_VOICEMAIL = 'reloadVoicemail';

    private const R_REST_API_WORKER = 'reloadRestAPIWorker';

    private const R_CALL_EVENTS_WORKER = 'reloadWorkerCallEvents';

    private const R_PBX_EXTENSION_STATE = 'afterModuleStateChanged';

    private const R_MOH = 'reloadMoh';

    private const R_NTP = 'reloadNtp';

    private int $last_change;
    private array $modified_tables;

    private int $timeout = 2;
    private array $arrObject;
    private array $PRIORITY_R;
    private array $pbxSettingsDependencyTable = [];
    private array $modelsDependencyTable = [];
    private ConfigClass $modulesConfigObj;

    /**
     * The entry point
     *
     * @param $params
     */
    public function start($params): void
    {
        $this->last_change = time() - 2;
        $this->arrObject   = $this->di->getShared(PBXConfModulesProvider::SERVICE_NAME);
        $this->modulesConfigObj  = new ConfigClass();

        $this->initPbxSettingsDependencyTable();
        $this->initModelsDependencyTable();

        $this->PRIORITY_R = [
            self::R_PBX_EXTENSION_STATE,
            self::R_TIMEZONE,
            self::R_SYSLOG,
            self::R_REST_API_WORKER,
            self::R_NETWORK,
            self::R_FIREWALL,
            self::R_FAIL2BAN_CONF,
            self::R_SSH,
            self::R_LICENSE,
            self::R_NATS,
            self::R_NTP,
            self::R_PHP_FPM,
            self::R_NGINX,
            self::R_NGINX_CONF,
            self::R_CRON,
            self::R_FEATURES,
            self::R_SIP,
            self::R_IAX,
            self::R_DIALPLAN,
            self::R_QUEUES,
            self::R_MANAGERS,
            self::R_CUSTOM_F,
            self::R_VOICEMAIL,
            self::R_MOH,
            self::R_CALL_EVENTS_WORKER,
        ];

        $this->modified_tables = [];

        /** @var BeanstalkClient $client */
        $client = $this->di->getShared(BeanstalkConnectionModelsProvider::SERVICE_NAME);
        $client->subscribe(self::class, [$this, 'processModelChanges']);
        $client->subscribe($this->makePingTubeName(self::class), [$this, 'pingCallBack']);
        $client->setTimeoutHandler([$this, 'timeoutHandler']);

        while ($this->needRestart === false) {
            $client->wait(5);
        }
        // Execute all collected changes before exit
        $this->timeoutHandler();
    }

    /**
     * Инициализация таблицы зависимостей настроек m_PbxSettings и сервисов АТС.
     */
    private function initPbxSettingsDependencyTable(): void
    {
        $tables = [];
        // FeaturesSettings
        $tables[] = [
            'settingName' => [
                'PBXLanguage',
                'PBXInternalExtensionLength',
                'PBXRecordCalls',
                'PBXCallParkingExt',
                'PBXCallParkingStartSlot',
                'PBXCallParkingEndSlot',
                'PBXFeatureAttendedTransfer',
                'PBXFeatureBlindTransfer',
                'PBXFeatureDigitTimeout',
                'PBXFeatureAtxferNoAnswerTimeout',
                'PBXFeatureTransferDigitTimeout',
                'PBXFeaturePickupExten',
            ],
            'functions'   => [
                self::R_FEATURES,
                self::R_DIALPLAN,
            ],
        ];
        // AMIParameters
        $tables[] = [
            'settingName' => [
                'AMIPort',
                'AJAMPort',
                'AJAMPortTLS',
            ],
            'functions'   => [
                self::R_MANAGERS,
            ],
        ];

        // IaxParameters
        $tables[] = [
            'settingName' => [
                'IAXPort',
            ],
            'functions'   => [
                self::R_IAX,
            ],
        ];
        // Гостевые звонки без авторизацим.
        $tables[] = [
            'settingName'   => [
                'PBXAllowGuestCalls'
            ],
            'functions' => [
                self::R_SIP,
                self::R_DIALPLAN
            ]
        ];
        // SipParameters
        $tables[] = [
            'settingName' => [
                'SIPPort',
                'RTPPortFrom',
                'RTPPortTo',
                'SIPDefaultExpiry',
                'SIPMinExpiry',
                'SIPMaxExpiry',
                'PBXLanguage',
            ],
            'functions'   => [
                self::R_SIP,
            ],
        ];

        // SSHParameters
        $tables[] = [
            'settingName' => [
                'SSHPort',
                'SSHPassword',
                'SSHAuthorizedKeys',
                'SSHRsaKey',
                'SSHDssKey',
                'SSHecdsaKey',
            ],
            'functions'   => [
                self::R_SSH,
            ],
        ];

        // FirewallParameters
        $tables[] = [
            'settingName' => [
                'SIPPort',
                'RTPPortFrom',
                'RTPPortTo',
                'IAXPort',
                'AMIPort',
                'AJAMPort',
                'AJAMPortTLS',
                'WEBPort',
                'WEBHTTPSPort',
                'SSHPort',
                'PBXFirewallEnabled',
                'PBXFail2BanEnabled',
            ],
            'functions'   => [
                self::R_FIREWALL,
            ],
            'strPosKey'   => 'FirewallSettings',
        ];

        // FirewallParameters
        $tables[] = [
            'settingName' => [
                'WEBPort',
                'WEBHTTPSPort',
                'WEBHTTPSPublicKey',
                'WEBHTTPSPrivateKey',
                'RedirectToHttps',
            ],
            'functions'   => [
                self::R_NGINX,
            ],
        ];

        // CronParameters
        $tables[] = [
            'settingName' => [
                'RestartEveryNight',
            ],
            'functions'   => [
                self::R_CRON,
            ],
        ];

        // DialplanParameters
        $tables[] = [
            'settingName' => [
                'PBXLanguage',
            ],
            'functions'   => [
                self::R_DIALPLAN,
            ],
        ];

        // VoiceMailParameters
        $tables[] = [
            'settingName' => [
                'MailTplVoicemailSubject',
                'MailTplVoicemailBody',
                'MailSMTPSenderAddress',
                'MailSMTPUsername',
                'PBXTimezone',
                'VoicemailNotificationsEmail',
                'SystemNotificationsEmail',
            ],
            'functions'   => [
                self::R_VOICEMAIL,
            ],
        ];

        // VisualLanguageSettings
        $tables[] = [
            'settingName' => [
                'SSHLanguage',
                'WebAdminLanguage',
            ],
            'functions'   => [
                self::R_REST_API_WORKER,
            ],
        ];

        // LicenseSettings
        $tables[] = [
            'settingName' => [
                'PBXLicense',
            ],
            'functions'   => [
                self::R_LICENSE,
                self::R_NATS,
            ],
        ];

        // TimeZoneSettings
        $tables[] = [
            'settingName' => [
                'PBXTimezone',
            ],
            'functions'   => [
                self::R_TIMEZONE,
                self::R_NGINX,
                self::R_PHP_FPM,
                self::R_REST_API_WORKER,
                self::R_SYSLOG,
            ],
        ];

        // NTPSettings
        $tables[] = [
            'settingName' => [
                'PBXManualTimeSettings',
                'NTPServer',
            ],
            'functions'   => [
                self::R_NTP,
            ],
        ];

        // CallRecordSettings
        $tables[] = [
            'settingName' => [
                'PBXRecordCalls',
                'PBXSplitAudioThread',
            ],
            'functions'   => [
                self::R_CALL_EVENTS_WORKER,
                self::R_DIALPLAN,
            ],
        ];

        $this->pbxSettingsDependencyTable = $tables;
    }

    /**
     * Инициализация таблицы зависимостей моделей и сервисов АТС.
     */
    private function initModelsDependencyTable(): void
    {
        $tables   = [];
        $tables[] = [
            'settingName' => [
                AsteriskManagerUsers::class,
            ],
            'functions'   => [
                self::R_MANAGERS,
            ],
        ];

        $tables[] = [
            'settingName' => [
                CallQueueMembers::class,
            ],
            'functions'   => [
                self::R_QUEUES,
            ],
        ];

        $tables[] = [
            'settingName' => [
                CallQueues::class,
            ],
            'functions'   => [
                self::R_QUEUES,
                self::R_DIALPLAN,
            ],
        ];
        $tables[] = [
            'settingName' => [
                ExternalPhones::class,
                Extensions::class,
                DialplanApplications::class,
                IncomingRoutingTable::class,
                IvrMenu::class,
                IvrMenuActions::class,
                OutgoingRoutingTable::class,
                OutWorkTimes::class,
                ConferenceRooms::class,
            ],
            'functions'   => [
                self::R_DIALPLAN,
            ],
        ];

        $tables[] = [
            'settingName' => [
                CustomFiles::class,
            ],
            'functions'   => [
                self::R_CUSTOM_F,
            ],
        ];

        $tables[] = [
            'settingName' => [
                Sip::class,
            ],
            'functions'   => [
                self::R_SIP,
                self::R_DIALPLAN,
                self::R_FIREWALL,
            ],
        ];

        $tables[] = [
            'settingName' => [
                Users::class,
                ExtensionForwardingRights::class,
            ],
            'functions'   => [
                self::R_SIP,
                self::R_DIALPLAN,
            ],
        ];

        $tables[] = [
            'settingName' => [
                FirewallRules::class,
                Fail2BanRules::class,
            ],
            'functions'   => [
                self::R_FIREWALL,
            ],
        ];

        $tables[] = [
            'settingName' => [
                Iax::class,
            ],
            'functions'   => [
                self::R_IAX,
                self::R_DIALPLAN,
            ],
        ];

        $tables[] = [
            'settingName' => [
                Codecs::class,
            ],
            'functions'   => [
                self::R_IAX,
                self::R_SIP,
            ],
        ];

        $tables[] = [
            'settingName' => [
                SoundFiles::class,
            ],
            'functions'   => [
                self::R_MOH,
                self::R_DIALPLAN,
            ],
        ];

        $tables[] = [
            'settingName' => [
                LanInterfaces::class,
            ],
            'functions'   => [
                self::R_NETWORK,
                self::R_IAX,
                self::R_SIP,
            ],
        ];

        $tables[] = [
            'settingName' => [
                SipHosts::class,
            ],
            'functions'   => [
                self::R_FIREWALL,
                self::R_SIP,
            ],
        ];

        $tables[] = [
            'settingName' => [
                NetworkFilters::class,
            ],
            'functions'   => [
                self::R_FIREWALL,
                self::R_SIP,
                self::R_MANAGERS,
            ],
        ];

        $this->modelsDependencyTable = $tables;
    }

    /**
     * Timeout handles
     */
    public function timeoutHandler(): void
    {
        $this->last_change = time() - $this->timeout;
        $this->startReload();
    }

    /**
     * Applies changes
     *
     * @return void
     */
    private function startReload(): void
    {
        if (count($this->modified_tables) === 0) {
            return;
        }
        $delta = time() - $this->last_change;
        if ($delta < $this->timeout) {
            return;
        }

        foreach ($this->PRIORITY_R as $method_name) {
            $action     = $this->modified_tables[$method_name] ?? null;
            $parameters = $this->modified_tables['parameters'][$method_name] ?? null;
            if ($action === null) {
                continue;
            }
            if (method_exists($this, $method_name)) {
                Util::sysLogMsg(__METHOD__, "Process changes by {$method_name}", LOG_DEBUG);
                if ($parameters === null) {
                    $this->$method_name();
                } else {
                    $this->$method_name($parameters);
                }
            }
        }
        // Send information about models changes to additional modules bulky without any details
        $this->modulesConfigObj->hookModulesMethod(ConfigClass::MODELS_EVENT_NEED_RELOAD, [$this->modified_tables]);
        $this->modified_tables = [];
    }

    /**
     * Parses for received Beanstalk message
     *
     * @param BeanstalkClient $message
     *
     * @throws \JsonException
     */
    public function processModelChanges(BeanstalkClient $message): void
    {
        $data            = $message->getBody();
        $receivedMessage = null;
        if ($data === self::R_NEED_RESTART) {
            $this->needRestart();
        }
        if (in_array($data, $this->PRIORITY_R, true)) {
            $this->modified_tables[$data] = true;
        } else {
            $receivedMessage = json_decode($message->getBody(), true, 512, JSON_THROW_ON_ERROR);
            $this->fillModifiedTables($receivedMessage);
        }
        $this->startReload();
        if ( ! $receivedMessage) {
            return;
        }
        // Send information about models changes to additional modules with changed data details
        $this->modulesConfigObj->hookModulesMethod(ConfigClass::MODELS_EVENT_CHANGE_DATA, [$receivedMessage]);
    }

    /**
     * Restarts Nginx daemon
     */
    public function needRestart(): void
    {
        $this->needRestart = true;
    }

    /**
     * Collects changes to determine which modules must be reloaded or reconfigured
     *
     * @param array $data
     */
    private function fillModifiedTables(array $data): void
    {
        $count_changes = count($this->modified_tables);
        $called_class  = $data['model'] ?? '';
        Util::sysLogMsg(__METHOD__, "New changes " . $called_class, LOG_DEBUG);
        // Clear all caches on any changed models on backend
        PbxSettings::clearCache($called_class, false);

        // Get new settings for dependence modules tables
        foreach ($this->arrObject as $appClass) {
            try {
                $dependencies = $appClass->getDependenceModels();
                if (in_array($called_class, $dependencies, true)) {
                    $appClass->getSettings();
                }
            } catch (\Throwable $e) {
                global $errorLogger;
                $errorLogger->captureException($e);
                Util::sysLogMsg(__METHOD__, $e->getMessage(), LOG_ERR);
                continue;
            }

        }

        $this->fillModifiedTablesFromModels($called_class);
        $this->fillModifiedTablesFromPbxSettingsData($called_class, $data['recordId']);
        $this->fillModifiedTablesFromPbxExtensionModules($called_class, $data['recordId']);

        if ($count_changes === 0 && count($this->modified_tables) > 0) {
            // Начинаем отсчет времени при получении первой задачи.
            $this->last_change = time();
        }
    }

    /**
     * Анализ изменения данных моделей ядра.
     *
     * @param $called_class
     */
    private function fillModifiedTablesFromModels($called_class): void
    {
        foreach ($this->modelsDependencyTable as $dependencydata) {
            if ( ! in_array($called_class, $dependencydata['settingName'], true)) {
                continue;
            }
            foreach ($dependencydata['functions'] as $function) {
                $this->modified_tables[$function] = true;
            }
        }
    }

    /**
     * Анализ изменения параметров в m_PbxSettings
     *
     * @param $called_class
     * @param $recordId
     */
    private function fillModifiedTablesFromPbxSettingsData($called_class, $recordId): void
    {
        if (PbxSettings::class !== $called_class) {
            return;
        }
        /** @var PbxSettings $pbxSettings */
        $pbxSettings = PbxSettings::findFirstByKey($recordId);
        if ($pbxSettings === null) {
            return;
        }
        $settingName = $pbxSettings->key;
        foreach ($this->pbxSettingsDependencyTable as $data) {
            $additionalConditions = (isset($data['strPosKey']) && strpos($settingName, $data['strPosKey']) !== false);
            if ( ! $additionalConditions && ! in_array($settingName, $data['settingName'], true)) {
                continue;
            }
            foreach ($data['functions'] as $function) {
                $this->modified_tables[$function] = true;
            }
        }
    }

    /**
     * Анализ изменения параметров дополнительный модулей.
     *
     * @param $called_class
     * @param $recordId
     */
    private function fillModifiedTablesFromPbxExtensionModules($called_class, $recordId): void
    {
        if (PbxExtensionModules::class !== $called_class) {
            return;
        }
        $moduleSettings = PbxExtensionModules::findFirstById($recordId);
        if ($moduleSettings !== null) {
            $this->modified_tables[self::R_PBX_EXTENSION_STATE]               = true;
            $this->modified_tables['parameters'][self::R_PBX_EXTENSION_STATE] = $moduleSettings;
        }
    }

    /**
     * Restarts gnats queue server daemon
     */
    public function reloadNats(): void
    {
        $natsConf = new NatsConf();
        $natsConf->reStart();
    }

    /**
     * Reloads Asterisk dialplan
     */
    public function reloadDialplan(): void
    {
        PBX::dialplanReload();
    }

    /**
     * Reloads Asterisk manager interface module
     */
    public function reloadManager(): void
    {
        PBX::managerReload();
    }

    /**
     * Generates queue.conf and restart asterisk queue module
     */
    public function reloadQueues(): void
    {
        QueueConf::queueReload();
    }

    /**
     * Updates custom changes in config files
     */
    public function updateCustomFiles(): void
    {
        System::updateCustomFiles();
    }

    /**
     * Applies iptables settings and restart firewall
     */
    public function reloadFirewall(): void
    {
        IptablesConf::reloadFirewall();
    }

    /**
     *  Refreshes networks configs and restarts network daemon
     */
    public function networkReload(): void
    {
        System::networkReload();
    }

    /**
     * Refreshes IAX configs and reload iax2 module
     */
    public function reloadIax(): void
    {
        PBX::iaxReload();
    }

    /**
     * Reloads MOH file list in Asterisk.
     */
    public function reloadMoh(): void
    {
        PBX::mohReload();
    }

    /**
     * Refreshes SIP configs and reload PJSIP module
     */
    public function reloadSip(): void
    {
        PBX::sipReload();
    }

    /**
     *  Refreshes features configs and reload features module
     */
    public function reloadFeatures(): void
    {
        PBX::featuresReload();
    }

    /**
     * Restarts CROND daemon
     */
    public function reloadCron(): void
    {
        $cron = new CronConf();
        $cron->reStart();
    }

    /**
     * Restarts NTP daemon
     */
    public function reloadNtp(): void
    {
        NTPConf::configure();
    }

    /**
     * Restarts Nginx daemon
     */
    public function reloadNginx(): void
    {
        $nginxConf = new NginxConf();
        $nginxConf->generateConf();
        $nginxConf->reStart();
    }

    /**
     * Applies modules locations changes and restarts Nginx daemon
     */
    public function reloadNginxConf(): void
    {
        $nginxConf = new NginxConf();
        $nginxConf->generateModulesConfigs();
        $nginxConf->reStart();
    }

    /**
     * Restarts Fail2Ban daemon
     */
    public function reloadFail2BanConf(): void
    {
        Fail2BanConf::reloadFail2ban();
    }

    /**
     * Restarts PHP-FPM daemon
     */
    public function reloadPHPFPM(): void
    {
        PHPConf::reStart();
    }

    /**
     * Configures SSH settings
     */
    public function reloadSSH(): void
    {
        $sshConf = new SSHConf();
        $sshConf->configure();
    }

    /**
     * Reconfigures TomeZone settings
     */
    public function updateTomeZone(): void
    {
        System::timezoneConfigure();
    }

    /**
     * Restarts rsyslog.
     */
    public function restartSyslogD(): void
    {
        // Рестарт демона Syslog.
        $syslogConf = new SyslogConf();
        $syslogConf->reStart();
    }

    /**
     *  Reloads Asterisk voicemail module
     */
    public function reloadVoicemail(): void
    {
        PBX::voicemailReload();
    }

    /**
     *  Reloads WorkerApiCommands worker
     */
    public function reloadRestAPIWorker(): void
    {
        Processes::processPHPWorker(WorkerApiCommands::class);
    }

    /**
     *  Reloads WorkerCallEvents worker
     */
    public function reloadWorkerCallEvents(): void
    {
        Processes::processPHPWorker(WorkerCallEvents::class);
    }

    /**
     * Process after PBXExtension state changes
     *
     * @param ?\MikoPBX\Common\Models\PbxExtensionModules $previousStageOfModuleRecord
     */
    public function afterModuleStateChanged(PbxExtensionModules $previousStageOfModuleRecord = null): void
    {
        if ($previousStageOfModuleRecord === null) {
            return;
        }
        // Recreate modules array
        PBXConfModulesProvider::recreateModulesProvider();

        // Recreate database connections
        ModulesDBConnectionsProvider::recreateModulesDBConnections();

        $this->arrObject = $this->di->get(PBXConfModulesProvider::SERVICE_NAME);

        $className       = str_replace('Module', '', $previousStageOfModuleRecord->uniqid);
        $configClassName = "\\Modules\\{$previousStageOfModuleRecord->uniqid}\\Lib\\{$className}Conf";
        if (class_exists($configClassName)) {
            $configClassObj = new $configClassName();

            // Reconfigure fail2ban and restart iptables
            if (method_exists($configClassObj, ConfigClass::GENERATE_FAIL2BAN_JAILS)
                && ! empty($configClassObj->generateFail2BanJails())) {
                self::invokeAction(self::R_FAIL2BAN_CONF);
            }
            // Refresh Nginx conf if module has any locations
            if (method_exists($configClassObj, ConfigClass::CREATE_NGINX_LOCATIONS)
                && ! empty($configClassObj->createNginxLocations())) {
                self::invokeAction(self::R_NGINX_CONF);
            }
            // Refresh crontab rules if module has any for it
            if (method_exists($configClassObj, ConfigClass::CREATE_CRON_TASKS)) {
                $tasks = [];
                $configClassObj->createCronTasks($tasks);
                if ( ! empty($tasks)) {
                    self::invokeAction(self::R_CRON);
                }
            }
            if ($previousStageOfModuleRecord->disabled === '1' && method_exists(
                    $configClassObj,
                    ConfigClass::ON_AFTER_MODULE_DISABLE
                )) {
                $configClassObj->onAfterModuleDisable();
            } elseif ($previousStageOfModuleRecord->disabled === '0' && method_exists(
                    $configClassObj,
                    ConfigClass::ON_AFTER_MODULE_ENABLE
                )) {
                $configClassObj->onAfterModuleEnable();
            }
        }
    }

    /**
     * Adds action to queue for postpone apply
     *
     * @param string $action
     * @param int    $priority
     */
    public static function invokeAction(string $action, $priority = 0): void
    {
        $di = Di::getDefault();
        /** @var BeanstalkClient $queue */
        $queue = $di->getShared(BeanstalkConnectionModelsProvider::SERVICE_NAME);
        $queue->publish(
            $action,
            self::class,
            $priority,
            PheanstalkInterface::DEFAULT_DELAY,
            3600
        );
    }
}

/**
 * The start point
 */
WorkerModelsEvents::startWorker($argv ?? null);