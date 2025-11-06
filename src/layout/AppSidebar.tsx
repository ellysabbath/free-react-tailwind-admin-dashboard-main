import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { authService } from "../services/authService";

// Interface definitions
interface SubItem {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
  roles?: string[];
}

// Define UserData interface based on what authService actually returns
interface UserData {
  id: string;
  role?: string; // Make role optional since it might be missing
  name?: string;
  email?: string;
  // Add other properties that your authService actually returns
}

interface OpenSubmenu {
  type: "main" | "others";
  index: number;
}

// Define all possible menu items with role restrictions
const allNavItems: NavItem[] = [
  {
    name: "Admin",
    icon: React.createElement(GridIcon),
    roles: ["admin", "teacher"],
    subItems: [
      { name: "collage results system", path: "/dashboard", pro: false },
      { name: "manage accounts", path: "/accounts", pro: false }
    ]
  },
  {
    name: "Academic year",
    icon: React.createElement(GridIcon),
    roles: ["admin", "superadmin", "teacher"],
    subItems: [
      { name: "Academic year", path: "/year", pro: false },
      { name: "semesters", path: "/year/semester", pro: false },
      { name: "subjects", path: "/year/semester/", pro: false },
      { name: "results", path: "/year/semester/results", pro: false }
    ]
  },
  {
    icon: React.createElement(GridIcon),
    name: "My Dashboard",
    roles: ["student", "user"],
    subItems: [{ name: "my results", path: "/dashboard", pro: false }],
  },
  {
    icon: React.createElement(CalenderIcon),
    name: "subjects",
    path: "/year/semester/",
    roles: ["teacher", "admin", "superadmin"],
  },
  {
    icon: React.createElement(CalenderIcon),
    name: "subjects",
    path: "/year/subjects/",
    roles: ["student"],
  },
  {
    icon: React.createElement(UserCircleIcon),
    name: "my Profile",
    path: "/profile",
    roles: ["student", "teacher", "admin", "superadmin"],
  },
  {
    name: "My results",
    icon: React.createElement(TableIcon),
    roles: ["student"],
    subItems: [
      { name: "my results", path: "/results", pro: false },
    ],
  },
  {
    name: "Teacher Portal",
    icon: React.createElement(UserCircleIcon),
    roles: ["teacher", "admin", "superadmin"],
    subItems: [
      { name: "upload results", path: "/teacher/upload", pro: false },
      { name: "manage classes", path: "/teacher/classes", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: React.createElement(PlugInIcon),
    name: "Sign Up or Sign in to an account",
    roles: ["guest"],
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
  {
    icon: React.createElement(UserCircleIcon),
    name: "Account",
    roles: ["student", "teacher", "admin", "superadmin"],
    subItems: [
      { name: "Logout", path: "/logout", pro: false },
      { name: "Settings", path: "/settings", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState<string>("guest");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filteredNavItems, setFilteredNavItems] = useState<NavItem[]>([]);
  const [filteredOthersItems, setFilteredOthersItems] = useState<NavItem[]>([]);

  const [openSubmenu, setOpenSubmenu] = useState<OpenSubmenu | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string): boolean => location.pathname === path,
    [location.pathname]
  );

  // Check if user has permission to access a menu item
  const hasPermission = useCallback((item: NavItem): boolean => {
    if (!item.roles || item.roles.length === 0) return true;
    
    if (userRole === "guest") {
      return item.roles.includes("guest");
    }
    
    return item.roles.includes(userRole);
  }, [userRole]);

  // Filter menu items based on user role
  const filterMenuItems = useCallback((): void => {
    const mainItems = allNavItems.filter(item => hasPermission(item));
    const others = othersItems.filter(item => hasPermission(item));
    
    setFilteredNavItems(mainItems);
    setFilteredOthersItems(others);
  }, [hasPermission]);

  // Get user data and role from authService
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    
    if (currentUser && isAuthenticated) {
      // Use type assertion through unknown to avoid direct type conflicts
      const userData = currentUser as unknown as UserData;
      setUserRole(userData.role || "student");
    } else {
      setUserRole("guest");
    }
    setIsLoading(false);
  }, []);

  // Re-filter menu items when user role changes
  useEffect(() => {
    filterMenuItems();
  }, [userRole, filterMenuItems]);

  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = (): void => {
      const currentUser = authService.getCurrentUser();
      const isAuthenticated = authService.isAuthenticated();
      
      if (currentUser && isAuthenticated) {
        const userData = currentUser as unknown as UserData;
        setUserRole(userData.role || "student");
      } else {
        setUserRole("guest");
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-open submenu when route matches
  useEffect(() => {
    let submenuMatched = false;
    
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? filteredNavItems : filteredOthersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path) && hasPermission(nav)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, filteredNavItems, filteredOthersItems, hasPermission]);

  // Calculate submenu height when opened
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others"): void => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // Secure link component that checks permissions before navigation
  interface SecureLinkProps {
    to: string;
    children: React.ReactNode;
    className: string;
    item: NavItem;
  }

  const SecureLink: React.FC<SecureLinkProps> = ({ to, children, className, item }) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
      if (!hasPermission(item)) {
        e.preventDefault();
        alert("You don't have permission to access this page");
        navigate("/unauthorized");
      }
    };

    return (
      <Link to={to} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others"): React.ReactElement => {
    return (
      <ul className="flex flex-col gap-4">
        {items.map((nav, index) => {
          if (!hasPermission(nav)) {
            return null;
          }

          return (
            <li key={`${nav.name}-${index}`}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size  ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    React.createElement(ChevronDownIcon, {
                      className: `ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`
                    })
                  )}
                </button>
              ) : (
                nav.path && (
                  <SecureLink 
                    to={nav.path} 
                    className={`menu-item group ${
                      isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                    }`}
                    item={nav}
                  >
                    <span
                      className={`menu-item-icon-size ${
                        isActive(nav.path)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                  </SecureLink>
                )
              )}
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <SecureLink
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                          item={nav}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </SecureLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <aside className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 w-[90px] lg:translate-x-0`}>
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="dark:text-green-500 font-bold text-center">MOROGORO TEACHERS COLLEGE</div>
          ) : (
            <div className="
              w-6 h-6 
              sm:w-7 sm:h-7 
              md:w-8 md:h-8 
              rounded-full overflow-hidden 
              border border-gray-300 dark:border-gray-600 
              shadow-sm transition-all duration-300
            ">
              {/* College logo placeholder */}
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  React.createElement(HorizontaLDots, { className: "size-6" })
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  React.createElement(HorizontaLDots)
                )}
              </h2>
              {renderMenuItems(filteredOthersItems, "others")}
            </div>
          </div>
        </nav>
        {userRole !== "guest" && (isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;