import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';

const DashboardHeader = styled.div`
    ${tw`flex justify-end items-center mb-4`};
`;

const AdminSwitch = styled.div`
    ${tw`flex items-center bg-neutral-800/90 px-4 py-2.5 rounded-lg mb-6`};
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SwitchLabel = styled.p`
    ${tw`text-sm text-neutral-200 mr-4 font-medium tracking-wide`};
`;

const NoServersMessage = styled.div`
    ${tw`flex flex-col items-center justify-center py-32 rounded-lg`};
    background: rgba(17, 17, 17, 0.3);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    
    & > p {
        ${tw`text-neutral-300 text-lg`};
    }
`;

const ServerGrid = styled.div`
    ${tw`grid gap-4`};
    grid-template-columns: repeat(2, 1fr);

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

const DashboardContent = styled.div`
    ${tw`bg-neutral-900/75 backdrop-blur-md rounded-lg border border-neutral-800/50`};
    box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.2),
        inset 0 1px rgba(255, 255, 255, 0.05);
`;

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    return (
        <PageContentBlock className='content-dashboard' title={'Tableau de bord'} showFlashKey={'dashboard'}>
            {rootAdmin && (
                <DashboardHeader>
                    <AdminSwitch>
                        <SwitchLabel>
                            {showOnlyAdmin ? "Affichage des serveurs des autres" : 'Affichage de vos serveurs'}
                        </SwitchLabel>
                        <Switch
                            name={'show_all_servers'}
                            defaultChecked={showOnlyAdmin}
                            onChange={() => setShowOnlyAdmin((s) => !s)}
                        />
                    </AdminSwitch>
                </DashboardHeader>
            )}
            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) =>
                        items.length > 0 ? (
                            <ServerGrid>
                                {items.map((server) => (
                                    <ServerRow key={server.uuid} server={server} />
                                ))}
                            </ServerGrid>
                        ) : (
                            <NoServersMessage>
                                <p>
                                    {showOnlyAdmin
                                        ? "Il n'y a pas d'autres serveurs à afficher."
                                        : "Il n'y a aucun serveur associé à votre compte."}
                                </p>
                            </NoServersMessage>
                        )
                    }
                </Pagination>
            )}
        </PageContentBlock>
    );
};
