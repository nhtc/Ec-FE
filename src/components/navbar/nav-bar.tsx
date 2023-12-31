import { Divider, Dropdown, Menu } from 'antd';
import { isEmpty } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/lib/reducers/model';
import { Nav, NavTypeEnum } from 'src/lib/types/backend_modal';
import RoutePaths from 'src/lib/utils/routes';
import { v4 as uuidv4 } from 'uuid';

import { HomeFilled, LogoutOutlined, SettingOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';

type MenuItem = Required<MenuProps>['items'][number];

import type { MenuProps } from 'antd';
function getItem(
  label: React.ReactNode,
  key?: React.Key | null,
  icon?: React.ReactNode,
  children?: MenuItem[],
  disabled?: boolean,
  danger?: true,
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    danger,
    disabled,
  } as MenuItem;
}

const Nav: React.FC = () => {
  const header: Nav[] = useSelector((state: RootState) => state.app.header);
  const router = useRouter();
  const [listNav, setListNav] = useState<MenuItem[]>();
  const myProfile = useSelector((state: RootState) => state.app.user);
  const getTargetUrl = (type: string, itemType: string, header: string) => {
    if (!type) return null;
    if (type.toLocaleUpperCase() === NavTypeEnum.DOCUMENT)
      return `${RoutePaths.DOCUMENT}?document=${itemType}&header=${header}&page=1`;
    else if (type.toLocaleUpperCase() === NavTypeEnum.COURSE)
      return `${RoutePaths.COURSE}?course=${itemType}&header=${header}&page=1`;
    else if (type.toLocaleUpperCase() === NavTypeEnum.CLASS)
      return `${RoutePaths.CLASS}?class=${itemType}&header=${header}&page=1`;
    else if (type.toLocaleUpperCase() === NavTypeEnum.POST)
      return `${RoutePaths.POST}?post=${itemType}&header=${header}&page=1`;
  };

  const checkTypeHeader = (navItem: Nav) => {
    return Object.values(NavTypeEnum).includes(navItem.type?.toLocaleUpperCase() as unknown as NavTypeEnum) ? (
      <Link href={getTargetUrl(navItem.type, 'ALL', navItem.header) || ''}>{navItem.header.toLocaleUpperCase()}</Link>
    ) : (
      <Link href={'/'} legacyBehavior>
        <a className="disabled-nav">{navItem.header.toLocaleUpperCase()}</a>
      </Link>
    );
  };

  const getListHeader = async () => {
    try {
      const listItems = header?.map((v, i) => {
        return getItem(
          <Link href={getTargetUrl(v.type, 'ALL', v.header) || ''}>{v.header.toLocaleUpperCase()}</Link>,
          v.header + `id=${uuidv4()}`,
          '',
          v.topic?.map((u, n) => {
            return getItem(
              <div
                css={css`
                  max-width: 100px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  .menu-item-link {
                    color: #fff !important;
                    &:hover {
                      text-decoration: none !important;
                      color: #fff !important;
                      outline: none !important;
                    }
                    &:focus {
                      text-decoration: none !important;
                      color: #fff !important;
                      outline: none !important;
                    }
                  }
                `}
              >
                <Link href={getTargetUrl(v.type, u.value, v.header) || ''} title={u.label} className="menu-item-link">
                  {u.label}
                </Link>
              </div>,
              u.label + `id=${uuidv4()}`,
            );
          }),
          !Object.values(NavTypeEnum).includes(v?.type?.toLocaleUpperCase() as unknown as NavTypeEnum),
        );
      });
      setListNav(listItems);
    } catch (error) {
      console.log(' error GetHeader', error);
    }
  };

  useEffect(() => {
    getListHeader();
  }, []);

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <Link href={RoutePaths.SETTINGS}>Cài đặt</Link>,
      icon: <SettingOutlined />,
    },
    {
      key: '2',
      label: <Link href={RoutePaths.LOGOUT}>Đăng xuất</Link>,
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <div
      className="nav-bar"
      css={css`
        display: flex;
        align-items: center;
        justify-content: space-between;

        border-radius: 5px;
        box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
        --bs-gutter-x: 5rem;
        --bs-gutter-y: 0;
        background-color: #4c4c4c !important;
        max-width: 1200px;
        margin: auto;
        margin-bottom: 30px;
        .left-box {
          display: flex;
          align-items: center;
          width: 80%;
          padding-right: 30px;

          > .ant-menu {
            width: 100%;
          }
        }
        .right-box {
          margin-right: 40px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          .ant-divider {
            background: #fff;
          }
          & a {
            width: 20px;
          }
          .anticon {
            color: #fff !important;
          }
        }
        .home {
          width: 160px;
          height: 47px;
          display: flex;
          align-items: center;
          background-color: #3a3a3a;
          border-radius: 5px;
          .logo {
            font-weight: 700;
            font-size: 12px;
            font-family: 'Montserrat';
            padding-left: 15px;
            color: #fff !important;
            text-decoration: none;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            .anticon-home {
              position: relative;
              top: -3px;
            }
            &:hover {
              text-decoration: none;
              letter-spacing: 0.5px;
              transition: all 400ms ease-in-out;
              font-weight: 700;
            }

            .anticon-home {
              margin-right: 5px;
              color: #fff;
            }
          }
        }
        .ant-menu-overflow {
          background-color: #4c4c4c;
          .ant-menu-overflow-item {
            background-color: #4c4c4c;
          }
        }
        .ant-menu-title-content {
          a {
            color: #fff !important;
          }
          height: fit-content;
        }
        .anticon {
          font-size: 20px;
          width: 20px;
          color: #000;
          cursor: pointer;
        }
        .ant-divider {
          width: 2px;
          height: 25px !important;
          color: #000;
          background: #000;
        }
        .ant-menu-horizontal {
          border: none;
        }
        .ant-menu-submenu-arrow {
          display: none;
        }
        .setting {
          .ant-menu-vertical {
            border-right: unset;
          }
          .ant-menu-submenu-title {
            padding: 0;
            line-height: unset !important;
            height: unset !important;
          }
        }
        .login-btn {
          font-weight: 700;
          color: #fff !important;
          width: 120px !important;
          text-decoration: none;
          &:hover {
            letter-spacing: 0.5px;
            transition: all 0.5s ease-in-out;
            text-decoration: none;
          }
        }
        .setting-btn {
          text-align: center;

          .setting-icon:hover {
            font-size: 25px;
          }
          transition: all 0.5s ease;
        }
        .cart-btn {
          text-align: center;

          .cart-icon:hover {
            font-size: 25px;
          }
          transition: all 0.5s ease;
        }
        .ant-menu,
        .ant-menu-submenu {
          a {
            text-decoration: none;
            color: #000;
            font-weight: 700;
            font-size: 12px;
            font-family: 'Montserrat';
            &:hover,
            &:focus {
              text-decoration: none;
              color: #000;
            }
          }
        }
        /* .ant-menu-item:has(a.disabled-nav) {
          &:hover {
            pointer-events: none;
            cursor: not-allowed;
          }
        } */
        .ant-menu-item-disabled {
          pointer-events: none;
        }
      `}
    >
      <div className="left-box">
        <div className="home">
          <Link href={'/'} className="logo">
            <HomeFilled />
            TRANG CHỦ
          </Link>
        </div>
        <Menu items={listNav} mode="horizontal" className="nav-menu" triggerSubMenuAction="hover" theme="dark" />
      </div>
      <div className="right-box">
        <Link href={RoutePaths.CART} className="cart-btn">
          <ShoppingCartOutlined className="cart-icon" />
        </Link>
        <Divider type="vertical" style={{ height: '100%' }} />

        {!isEmpty(myProfile) ? (
          <Dropdown
            menu={{ items }}
            placement="bottom"
            arrow
            className="cuongDropdown"
            overlayStyle={{ minWidth: 130 }}
          >
            <UserOutlined className="setting-icon" />
          </Dropdown>
        ) : (
          <Link href={RoutePaths.LOGIN} className="login-btn">
            Đăng nhập
          </Link>
        )}
      </div>
    </div>
  );
};

export default Nav;
