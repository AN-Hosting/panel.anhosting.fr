import React from 'react';
import BoringAvatar, { AvatarProps } from 'boring-avatars';
import { useStoreState } from '@/state/hooks';
import md5 from 'md5';

const palette = ['#FFAD08', '#EDD75A', '#73B06F', '#0C8F8F', '#587291'];

type Props = Omit<AvatarProps, 'colors'>;

const _Avatar = ({ variant = 'beam', ...props }: AvatarProps) => (
    <BoringAvatar colors={palette} variant={variant} {...props} />
);

const _UserAvatar = ({ variant = 'beam', size = "32", ...props }: Omit<Props, 'name'>) => {
    const uuid = useStoreState((state) => state.user.data?.uuid);
    const email = useStoreState((state) => state.user.data?.email);

    // Si l'email existe, utiliser Gravatar
    if (email) {
        const hash = md5(email.trim().toLowerCase());
        return (
            <img 
                src={`https://www.gravatar.com/avatar/${hash}?d=mp&s=${size}`}
                alt="Avatar"
                className="rounded-full"
                width={size}
                height={size}
                {...props}
            />
        );
    }

    // Sinon utiliser BoringAvatar
    return <BoringAvatar 
        colors={palette} 
        name={uuid || 'system'} 
        variant={variant} 
        size={size}
        {...props} 
    />;
};

_Avatar.displayName = 'Avatar';
_UserAvatar.displayName = 'Avatar.User';

const Avatar = Object.assign(_Avatar, {
    User: _UserAvatar,
});

export default Avatar;
