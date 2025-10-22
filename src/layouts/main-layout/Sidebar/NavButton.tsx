import { ReactElement, useState } from 'react';
import { Collapse, Link, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { NavLink as RouterLink } from 'react-router-dom';

import IconifyIcon from 'components/base/IconifyIcon';
import { NavItem } from 'data/nav-items'; // Sesuaikan path jika perlu

interface NavButtonProps {
  navItem: NavItem;
}

const NavButton = ({ navItem }: NavButtonProps): ReactElement => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (navItem.collapsible) {
      setOpen(!open);
    }
  };

  // Komponen Link utama
  const MainLink = (
    <ListItemButton
      component={navItem.collapsible ? 'div' : RouterLink}
      to={navItem.path}
      onClick={handleClick}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        // Styling untuk link yang aktif
        '&.active': {
          backgroundColor: 'primary.main',
          color: 'common.white',
          '& .MuiListItemIcon-root': {
            color: 'common.white',
          },
        },
      }}
    >
      {navItem.icon && (
        <ListItemIcon>
          <IconifyIcon icon={navItem.icon} />
        </ListItemIcon>
      )}
      <ListItemText primary={navItem.title} />
      {navItem.collapsible && (
        <IconifyIcon icon={open ? 'mdi:chevron-down' : 'mdi:chevron-right'} />
      )}
    </ListItemButton>
  );

  return (
    <>
      {MainLink}
      {navItem.collapsible && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 2 }}>
            {navItem.sublist?.map((subItem, index) => (
              // Rekursif memanggil NavButton untuk sub-item
              <NavButton key={index} navItem={subItem} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export default NavButton;
