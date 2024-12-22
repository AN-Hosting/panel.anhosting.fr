import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faHdd, faMemory, faMicrochip, faServer, faPlay, faStop, faRedo, faBolt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import Spinner from '@/components/elements/Spinner';
import styled from 'styled-components/macro';
import isEqual from 'react-fast-compare';
import { ServerContext } from '@/state/server';
import http from '@/api/http';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import Tooltip from '@/components/elements/tooltip/Tooltip';

// Determines if the current value is in an alarm threshold so we can show it in red rather
// than the more faded default style.
const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const Icon = memo(
    styled(FontAwesomeIcon)<{ $alarm: boolean }>`
        ${(props) => (props.$alarm ? tw`text-red-400` : tw`text-neutral-500`)};
    `,
    isEqual
);

const IconDescription = styled.p<{ $alarm: boolean }>`
    ${tw`text-sm ml-2`};
    ${(props) => (props.$alarm ? tw`text-white` : tw`text-neutral-400`)};
`;

const StatusIndicatorBox = styled(GreyRowBox)<{ $status: ServerPowerState | undefined }>`
    ${tw`grid grid-cols-12 gap-4 relative`};

    & .status-bar {
        ${tw`w-2 bg-red-500 absolute right-0 z-20 rounded-full m-1 opacity-50 transition-all duration-150`};
        height: calc(100% - 0.5rem);

        ${({ $status }) =>
            !$status || $status === 'offline'
                ? tw`bg-red-500`
                : $status === 'running'
                ? tw`bg-green-500`
                : tw`bg-yellow-500`};
    }

    &:hover .status-bar {
        ${tw`opacity-75`};
    }
`;

type Timer = ReturnType<typeof setInterval>;

// Ajout du type pour le status
type ServerStatus = 'running' | 'offline' | 'starting' | 'stopping' | string;

const getStatusColor = (status?: ServerStatus) => {
    switch (status) {
        case 'running':
            return 'rgba(16, 185, 129, 0.1)';
        case 'offline':
            return 'rgba(239, 68, 68, 0.1)';
        case 'starting':
        case 'stopping':
            return 'rgba(245, 158, 11, 0.1)';
        default:
            return 'rgba(75, 85, 99, 0.1)';
    }
};

const ActionBar = styled.div`
    ${tw`flex items-center justify-center gap-1 px-4 py-2 bg-neutral-900/50 rounded-b-lg border-t border-neutral-800 transition-all duration-200`};
    className: 'action-bar';
`;

const ServerCard = styled.div<{ $status?: ServerStatus }>`
    ${tw`bg-neutral-900/50 backdrop-blur-sm rounded-t-lg transition-all duration-200`};
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-bottom: none;
`;

const ServerWrapper = styled.div<{ $status?: ServerStatus }>`
    ${tw`transition-all duration-200`};
    className: 'server-wrapper';

    &:hover {
        transform: translateX(0.25rem) translateY(-0.25rem);
        
        ${ServerCard}, ${ActionBar} {
            background: ${props => getStatusColor(props.$status)};
            border-color: ${props => {
                switch (props.$status) {
                    case 'running':
                        return 'rgba(16, 185, 129, 0.5)';
                    case 'offline':
                        return 'rgba(239, 68, 68, 0.5)';
                    case 'starting':
                    case 'stopping':
                        return 'rgba(245, 158, 11, 0.5)';
                    default:
                        return 'rgba(75, 85, 99, 0.5)';
                }
            }};
        }
    }
`;

const ServerHeader = styled.div`
    ${tw`flex items-center p-4 h-16`};
    className: 'server-header';
`;

const ServerIcon = styled.div<{ $status?: ServerStatus }>`
    ${tw`flex items-center justify-center w-10 h-10 rounded-lg mr-4 flex-shrink-0 transition-colors duration-150`};
    background: ${props => {
        switch (props.$status) {
            case 'running':
                return 'rgba(16, 185, 129, 0.1)';
            case 'offline':
                return 'rgba(239, 68, 68, 0.1)';
            case 'starting':
            case 'stopping':
                return 'rgba(245, 158, 11, 0.1)';
            default:
                return 'rgba(75, 85, 99, 0.1)';
        }
    }};
    color: ${props => {
        switch (props.$status) {
            case 'running':
                return 'rgb(16, 185, 129)';
            case 'offline':
                return 'rgb(239, 68, 68)';
            case 'starting':
            case 'stopping':
                return 'rgb(245, 158, 11)';
            default:
                return 'rgb(156, 163, 175)';
        }
    }};
    className: 'server-icon';
`;

const ServerInfo = styled.div`
    ${tw`flex-1 min-w-0`};
`;

const ServerName = styled.p`
    ${tw`text-sm text-neutral-100 font-medium truncate`};
    className: 'server-name';
`;

const ServerDescription = styled.p`
    ${tw`text-xs text-neutral-400 truncate mt-1`};
    className: 'server-description';
`;

const StatsContainer = styled.div`
    ${tw`grid grid-cols-3 gap-4 px-4 py-2 bg-neutral-800/50 rounded-b-lg`};
    className: 'stats-container';
`;

const StatItem = styled.div`
    ${tw`flex flex-col items-center py-2`};
    className: 'stat-item';
`;

const StatValue = styled.p<{ $alarm?: boolean }>`
    ${tw`text-sm font-medium transition-colors duration-150`};
    ${props => props.$alarm ? tw`text-red-400` : tw`text-neutral-100`};
`;

const StatCurrent = styled.p`
    ${tw`text-xs text-neutral-400 mt-0.5`};
    className: 'stat-current';
`;

const StatLabel = styled.p`
    ${tw`text-xs text-neutral-400 mt-1`};
    className: 'stat-label';
`;

const ActionButton = styled.button<{ $color?: string }>`
    ${tw`flex items-center justify-center w-9 h-9 rounded-md transition-all duration-150 z-10`};
    background: ${props => props.$color ? `rgba(${props.$color}, 0.1)` : 'rgba(75, 85, 99, 0.1)'};
    color: ${props => props.$color ? `rgb(${props.$color})` : 'rgb(156, 163, 175)'};

    &:hover:not(:disabled) {
        background: ${props => props.$color ? `rgba(${props.$color}, 0.2)` : 'rgba(75, 85, 99, 0.2)'};
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
    className: 'action-button';
`;

export default ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        // Don't waste a HTTP request if there is nothing important to show to the user because
        // the server is suspended.
        if (isSuspended) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended]);

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
    }

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
    const cpuLimit = server.limits.cpu !== 0 ? server.limits.cpu + ' %' : 'Unlimited';

    const serverHostname = server.variables?.find((v) => v.envVariable === 'SERVER_HOSTNAME')?.serverValue || server.name;
    const maxPlayers = server.variables?.find((v) => v.envVariable === 'MAX_PLAYERS')?.serverValue || '0';

    // Conversion explicite du status en string
    const status = (stats?.status || server.status) as ServerStatus;

    const sendPowerAction = async (action: PowerAction) => {
        try {
            await http.post(`/api/client/servers/${server.uuid}/power`, { signal: action });
        } catch (error) {
            console.error('Error sending power action:', error);
        }
    };

    const isRunning = status === 'running';
    const isOffline = status === 'offline';
    const isStarting = status === 'starting';
    const isStopping = status === 'stopping';

    return (
        <ServerWrapper $status={status}>
            <ServerCard $status={status}>
                <Link to={`/server/${server.id}`} className="block">
                    <ServerHeader>
                        <ServerIcon $status={status}>
                            <FontAwesomeIcon icon={faServer} className="w-5 h-5" />
                        </ServerIcon>
                        <ServerInfo>
                            <ServerName>{server.name}</ServerName>
                            <ServerDescription>
                                {server.allocations
                                    .filter((alloc) => alloc.isDefault)
                                    .map((allocation) => (
                                        <span key={allocation.ip + allocation.port.toString()}>
                                            {allocation.alias || ip(allocation.ip)}:{allocation.port}
                                        </span>
                                    ))}
                            </ServerDescription>
                        </ServerInfo>
                    </ServerHeader>
                    <StatsContainer>
                        <StatItem>
                            <StatCurrent>
                                {stats ? bytesToString(stats.memoryUsageInBytes) : '—'}
                            </StatCurrent>
                            <StatLabel>Mémoire</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatCurrent>
                                {stats ? bytesToString(stats.diskUsageInBytes) : '—'}
                            </StatCurrent>
                            <StatLabel>Disque</StatLabel>
                        </StatItem>
                        <StatItem>
                            <StatCurrent>
                                {stats ? `${stats.cpuUsagePercent.toFixed(1)}%` : '—'}
                            </StatCurrent>
                            <StatLabel>CPU</StatLabel>
                        </StatItem>
                    </StatsContainer>
                </Link>
            </ServerCard>
            <ActionBar>
                <Tooltip placement={'top'} content="Démarrer le serveur">
                    <ActionButton
                        onClick={() => sendPowerAction('start')}
                        disabled={!isOffline}
                        $color="16, 185, 129"
                    >
                        <FontAwesomeIcon icon={faPlay} />
                    </ActionButton>
                </Tooltip>
                <Tooltip placement={'top'} content="Arrêter le serveur">
                    <ActionButton
                        onClick={() => sendPowerAction('stop')}
                        disabled={!isRunning}
                        $color="239, 68, 68"
                    >
                        <FontAwesomeIcon icon={faStop} />
                    </ActionButton>
                </Tooltip>
                <Tooltip placement={'top'} content="Redémarrer le serveur">
                    <ActionButton
                        onClick={() => sendPowerAction('restart')}
                        disabled={!isRunning}
                        $color="245, 158, 11"
                    >
                        <FontAwesomeIcon icon={faRedo} />
                    </ActionButton>
                </Tooltip>
                <Tooltip placement={'top'} content="Forcer l'arrêt du serveur">
                    <ActionButton
                        onClick={() => sendPowerAction('kill')}
                        disabled={isOffline}
                        $color="239, 68, 68"
                    >
                        <FontAwesomeIcon icon={faBolt} />
                    </ActionButton>
                </Tooltip>
            </ActionBar>
        </ServerWrapper>
    );
};
