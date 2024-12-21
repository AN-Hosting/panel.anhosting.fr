import React, { memo } from 'react';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import Spinner from '@/components/elements/Spinner';
import Features from '@feature/Features';
import Console from '@/components/server/console/Console';
import StatGraphs from '@/components/server/console/StatGraphs';
import PowerButtons from '@/components/server/console/PowerButtons';
import MoreButtons from '@/components/server/console/MoreButtons';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import { Alert } from '@/components/elements/alert';
import style from './style.module.css';
import { useStoreState } from 'easy-peasy';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const ServerConsoleContainer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);
    const variables = ServerContext.useStoreState((state) => state.server.data!.variables);
    const serverHostname = variables.find((v) => v.envVariable === 'SERVER_HOSTNAME')?.serverValue || name;
    const internalId = ServerContext.useStoreState((state) => state.server.data!.internalId);
    const maxPlayers = variables.find((v) => v.envVariable === 'MAX_PLAYERS')?.serverValue || '0';

    return (
        <ServerContentBlock title={'Console'}>
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {isNodeUnderMaintenance
                        ? 'Le nœud de ce serveur est actuellement en maintenance et toutes les actions sont indisponibles.'
                        : isInstalling
                        ? 'Ce serveur est en cours d\'installation et la plupart des actions sont indisponibles.'
                        : 'Ce serveur est en cours de transfert vers un autre nœud et toutes les actions sont indisponibles.'}
                </Alert>
            )}
            <div className={'grid grid-cols-4 gap-4 mb-4'}>
                <div className={'hidden sm:block sm:col-span-2 lg:col-span-3 pr-4'}>
                    <div className={'flex items-center justify-between'}>
                        <h1 className={'font-header text-2xl text-gray-50 leading-relaxed line-clamp-1'}>
                            {internalId} - {serverHostname} - {maxPlayers} Slots
                        </h1>
                    </div>
                    <p className={'text-sm line-clamp-2'}>{description}</p>
                </div>
                <div className={'col-span-4 sm:col-span-2 lg:col-span-1 self-end'}>
                    <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                        <PowerButtons className={'flex sm:justify-end space-x-2'} />
                    </Can>
                    <br />
                    <div className={'col-span-4 sm:col-span-3 lg:col-span-3 self-end'}>
                        <MoreButtons className={style.buttons_layout} />
                    </div>
                </div>
            </div>
            <div className={'grid grid-cols-4 gap-2 sm:gap-4 mb-4'}>
                <div className={'flex col-span-4 lg:col-span-3'}>
                    <Spinner.Suspense>
                        <Console />
                    </Spinner.Suspense>
                </div>
                <ServerDetailsBlock className={'col-span-4 lg:col-span-1 order-last lg:order-none'} />
            </div>
            <div className={'grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4'}>
                <Spinner.Suspense>
                    <StatGraphs />
                </Spinner.Suspense>
            </div>
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);
