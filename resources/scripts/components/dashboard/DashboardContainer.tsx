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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faServer, faNetworkWired, faMicrochip, faMemory, faHdd, faPowerOff } from '@fortawesome/free-solid-svg-icons'; 
import tw from 'twin.macro'; 
import useSWR from 'swr'; 
import { PaginatedResult } from '@/api/http'; 
import Pagination from '@/components/elements/Pagination'; 
import { useLocation } from 'react-router-dom'; 
import styled from 'styled-components/macro'; 

const TableDiv = styled.div`
    overflow-x:auto;
`; 

const Table = styled.table`
    background-color: var(--pageSecondary, #1f2933);
    width: 100%;
    border-radius: 25px;
    border-collapse: collapse;

    & > thead > tr > th {
        ${tw`text-neutral-400`};
        text-align: left;
        font-weight: normal;
        padding: 2.5em 1.5em .8em;
        position: relative;
    }

    & > tbody > tr > td {
        padding: .5em 1.5em;
        position: relative;
    }

    & > tbody > tr > td:not(:last-of-type)::after {
        content: "";
        position: absolute;
        top: 25%; 
        bottom: 25%; 
        right: 0;
        width: 1px;
        background-color: rgba(255, 255, 255, 0.1);
    }

    & > tbody > tr:last-of-type > td {
        padding: .5em 1.5em 2.5em;
    }

    & > tbody > tr > td > span {
        ${tw`text-neutral-400`};
        font-size: .7em;
    }

    & > tbody > tr > td:first-of-type {
        ${tw`text-neutral-400`};
    }
`;

const FooterRow = styled.tr`
    ${tw`text-center text-blue-500`}
    font-weight: bold;
    td {
        padding: 0.5em;
        text-align: center;
    }
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
        window.history.replaceState(null, document.title, `/${page <= 1 ? '': `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard' , error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'} className={'mt-4 sm:mt-10'}>
            {rootAdmin && (
                <div css={tw`pr-4 mb-2 flex justify-end items-center`}>
                    <p css={tw`uppercase text-xs text-neutral-300 mr-2`}>
                        {showOnlyAdmin ? 'Showing others servers' : 'Showing your servers'}
                    </p>
                    <Switch
                        name={'show_all_servers'}
                        defaultChecked={showOnlyAdmin}
                        onChange={() => setShowOnlyAdmin((s) => !s)}
                    />
                </div>
            )}
            <TableDiv>
                <Table>
                    <thead>
                        <tr>
                            <th><FontAwesomeIcon icon={faServer} css={tw`mr-2`} /> Server</th>
                            <th className='hidden sm:table-cell'><FontAwesomeIcon icon={faNetworkWired} css={tw`mr-2`} /> Allocation</th>
                            <th className='hidden sm:table-cell'><FontAwesomeIcon icon={faMicrochip} css={tw`mr-2`} /> CPU</th>
                            <th className='hidden sm:table-cell'><FontAwesomeIcon icon={faMemory} css={tw`mr-2`} /> Ram</th>
                            <th className='hidden sm:table-cell'><FontAwesomeIcon icon={faHdd} css={tw`mr-2`} /> Disk</th>
                            <th><FontAwesomeIcon icon={faPowerOff} css={tw`mr-2`} /> Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!servers ? (
                            <tr>
                                <td colSpan={6}>
                                    <Spinner centered size={'large'} />
                                </td>
                            </tr>
                        ) : (
                            <Pagination data={servers} onPageSelect={setPage}>
                                {({ items }) =>
                                    items.length > 0 ? (
                                        items.map((server, index) => (
                                            <ServerRow key={server.uuid} server={server} css={index > 0 ? tw`mt-2` : undefined} />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6}>No other servers found.</td>
                                        </tr>
                                    )
                                }
                            </Pagination>
                        )}
                        <FooterRow>
                            <td colSpan={6}></td>
                        </FooterRow>
                    </tbody>
                </Table>
            </TableDiv>
        </PageContentBlock>
    );
};
