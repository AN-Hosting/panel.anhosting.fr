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
        ${tw`flex items-center h-full no-underline text-neutral-300 px-3 cursor-pointer transition-all duration-150`};

        svg {
            ${tw`text-lg`};
        }

        &:active,
        &:hover {
            ${tw`text-neutral-100`};
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className={'bg-neutral-900 shadow-md overflow-x-auto fixed w-full z-50 topbar'}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div className={'w-full h-[3rem] flex items-center px-4 lg:px-6'}>
                {/* Section Gauche */}
                <div className={'w-1/3 md:w-1/4 flex items-center gap-4'}>
                    {showSidebar && (
                        <FontAwesomeIcon
                            icon={faBars}
                            className='navbar-button text-neutral-300 hover:text-neutral-100 transition-colors duration-150'
                            onClick={onTriggerNavButton}
                        />
                    )}
                    <div id={'logo'}>
                        <Link
                            to={'/'}
                            className={'text-xl font-header no-underline text-neutral-100 hover:text-neutral-200 transition-colors duration-150 flex items-center whitespace-nowrap gap-2'}
                        >
                            <img 
                                src="/logo.png" 
                                alt="Logo" 
                                className="h-7 w-auto"
                            />
                            <span className="hidden md:inline">
                                {name}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Section Centrale - Desktop */}
                <div className={'w-2/4 hidden md:flex items-center justify-center'}>
                    <div className="flex items-center justify-center gap-2">
                        <div className="px-3 py-2 flex items-center hover:bg-neutral-800 rounded-md whitespace-nowrap">
                            <SearchContainer />
                        </div>
                        <div className="flex items-center justify-center gap-1">
                            <Tooltip placement={'bottom'} content="Site Web">
                                <a href={'https://anhosting.fr'} className="px-3 py-2 flex items-center hover:bg-neutral-800 rounded-md whitespace-nowrap" target="_blank" rel="noreferrer">
                                    <FontAwesomeIcon icon={faGlobe as IconProp} className="mr-2" />
                                    <span>Site Web</span>
                                </a>
                            </Tooltip>
                            <Tooltip placement={'bottom'} content="Discord">
                                <a href={'https://discord.gg/votre-serveur'} className="px-3 py-2 flex items-center hover:bg-neutral-800 rounded-md whitespace-nowrap" target="_blank" rel="noreferrer">
                                    <FontAwesomeIcon icon={faDiscord as IconProp} className="mr-2" />
                                    <span>Discord</span>
                                </a>
                            </Tooltip>
                            <Tooltip placement={'bottom'} content="Documentation">
                                <a href={'https://docs.anhosting.fr'} className="px-3 py-2 flex items-center hover:bg-neutral-800 rounded-md whitespace-nowrap" target="_blank" rel="noreferrer">
                                    <FontAwesomeIcon icon={faBook} className="mr-2" />
                                    <span>Documentation</span>
                                </a>
                            </Tooltip>
                            <Tooltip placement={'bottom'} content="Boutique">
                                <a href={'https://client.anhosting.fr'} className="px-3 py-2 flex items-center hover:bg-neutral-800 rounded-md whitespace-nowrap" target="_blank" rel="noreferrer">
                                    <FontAwesomeIcon icon={faStore} className="mr-2" />
                                    <span>Boutique</span>
                                </a>
                            </Tooltip>
                            <Tooltip placement={'bottom'} content="Accueil">
                                <NavLink to={'/'} exact className="px-3 py-2 flex items-center hover:bg-neutral-800 rounded-md whitespace-nowrap">
                                    <FontAwesomeIcon icon={faHome} className="mr-2" />
                                    <span>Accueil</span>
                                </NavLink>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* Section Droite */}
                <div className={'w-2/3 md:w-1/4 flex items-center justify-end gap-2'}>
                    {/* Menu mobile pour les liens du centre */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="px-3 py-2 flex items-center hover:bg-neutral-800 rounded-md"
                        >
                            <FontAwesomeIcon icon={faBars} className="text-neutral-300 hover:text-neutral-100" />
                        </button>
                    </div>
                    
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content="Admin">
                            <a href={'/admin'} rel={'noreferrer'} className="px-3 py-2 flex items-center hover:bg-neutral-800 rounded-md whitespace-nowrap">
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content="Paramètres">
                        <NavLink to={'/account'} className="px-3 py-2 flex items-center hover:bg-neutral-800 rounded-md whitespace-nowrap">
                            <span className={'flex items-center w-5 h-5'}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content="Déconnexion">
                        <button onClick={onTriggerLogout} className="px-3 py-2 flex items-center hover:bg-neutral-800 rounded-md whitespace-nowrap">
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Menu Mobile */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed top-[3rem] left-0 right-0 bg-neutral-900 border-t border-neutral-800 shadow-lg">
                    <div className="p-4 space-y-2">
                        <div className="px-3 py-2">
                            <SearchContainer />
                        </div>
                        <a href={'https://anhosting.fr'} className="flex items-center px-3 py-2 hover:bg-neutral-800 rounded-md" target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faGlobe as IconProp} className="mr-3" />
                            <span>Site Web</span>
                        </a>
                        <a href={'https://discord.gg/votre-serveur'} className="flex items-center px-3 py-2 hover:bg-neutral-800 rounded-md" target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faDiscord as IconProp} className="mr-3" />
                            <span>Discord</span>
                        </a>
                        <a href={'https://docs.anhosting.fr'} className="flex items-center px-3 py-2 hover:bg-neutral-800 rounded-md" target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faBook} className="mr-3" />
                            <span>Documentation</span>
                        </a>
                        <a href={'https://client.anhosting.fr'} className="flex items-center px-3 py-2 hover:bg-neutral-800 rounded-md" target="_blank" rel="noreferrer">
                            <FontAwesomeIcon icon={faStore} className="mr-3" />
                            <span>Boutique</span>
                        </a>
                        <NavLink to={'/'} exact className="flex items-center px-3 py-2 hover:bg-neutral-800 rounded-md">
                            <FontAwesomeIcon icon={faHome} className="mr-3" />
                            <span>Accueil</span>
                        </NavLink>
                    </div>
                </div>
            )}
        </div>
    );
};
