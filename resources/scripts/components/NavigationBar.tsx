import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCogs, faHome, faSignOutAlt, faBook, faGlobe, faStore } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw, { theme } from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center h-full no-underline text-neutral-300 px-6 cursor-pointer transition-all duration-150`};

        &:active,
        &:hover {
            ${tw`text-neutral-100 bg-black`};
        }

        &:active,
        &:hover,
        &.active {
            box-shadow: inset 0 -2px ${theme`colors.cyan.600`.toString()};
        }
    }
`;

const onTriggerNavButton = () => {
    const sidebar = document.getElementById('sidebar');

    if (sidebar) {
        sidebar.classList.toggle('active-nav');
    }
};

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const location = useLocation();
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        if (location.pathname.startsWith('/server') || location.pathname.startsWith('/account')) {
            setShowSidebar(true);
            return;
        }
        setShowSidebar(false);
    }, [location.pathname]);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <div className={'bg-neutral-700 shadow-md overflow-x-auto topbar'}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'mx-auto w-full flex items-center h-[3.5rem] max-w-[1200px]'}>
                {showSidebar && (
                    <FontAwesomeIcon
                        icon={faBars}
                        className='navbar-button'
                        onClick={onTriggerNavButton}
                    ></FontAwesomeIcon>
                )}

                <div id={'logo'} className={'flex-1'}>
                    <Link
                        to={'/'}
                        className={
                            'text-2xl font-header px-4 no-underline text-neutral-200 hover:text-neutral-100 transition-colors duration-150'
                        }
                    >
                        {name}
                    </Link>
                </div>

                <RightNavigation className={'flex h-full items-center justify-center'}>
                    <SearchContainer />
                    {/* Site Web */}
                    <Tooltip placement={'bottom'} content={'Site Web'}>
                        <a href={'https://anhosting.fr'} target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faGlobe as IconProp} />
                        </a>
                    </Tooltip>
                    {/* Discord */}
                    <Tooltip placement={'bottom'} content={'Discord'}>
                        <a href={'https://discord.gg/votre-serveur'} target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faDiscord as IconProp} />
                        </a>
                    </Tooltip>
                    {/* Documentation */}
                    <Tooltip placement={'bottom'} content={'Documentation'}>
                        <a href={'https://docs.anhosting.fr'} target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faBook} />
                        </a>
                    </Tooltip>
                    {/* Panel Client */}
                    <Tooltip placement={'bottom'} content={'Panel Client'}>
                        <a href={'https://client.anhosting.fr'} target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faStore} />
                        </a>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Tableau de bord'}>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faHome} />
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Administration'}>
                            <a href={'/admin'} rel={'noreferrer'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Paramètres du compte'}>
                        <NavLink to={'/account'}>
                            <span className={'flex items-center w-5 h-5'}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Déconnexion'}>
                        <button onClick={onTriggerLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </div>
        </div>
    );
};
