import React from 'react';
import clsx from 'clsx'; // ✅ Optional: for cleaner class handling (install with `npm i clsx`)

const UserAvatar = ({
  initials,
  profileImage = '',
  size = 'md',
  border = 'none',
  id,
  badge
}) => {
  const sizeClass = {
    sm: 'w-9 h-9 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-16 h-16 text-xl'
  };

  const ringClassMap = {
    blue: 'ring-blue-500',
    orange: 'ring-orange-500',
    green: 'ring-green-500',
    red: 'ring-red-500',
    none: ''
  };

  const ringClass = border !== 'none' ? `ring-2 ${ringClassMap[border]}` : '';

  return (
    <div className="relative" id={id}>
      {profileImage ? (
        <img
          src={profileImage}
          alt="Avatar"
          className={clsx(
            'rounded-full object-cover',
            ringClass,
            sizeClass[size]
          )}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/avatar.png';
          }}
        />
      ) : (
        <div
          className={clsx(
            'rounded-full bg-gray-200 text-gray-800 flex items-center justify-center font-semibold',
            ringClass,
            sizeClass[size]
          )}
        >
          {initials}
        </div>
      )}

      {/* Optional badge */}
      {badge && (
        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
      )}
    </div>
  );
};

export default UserAvatar;
