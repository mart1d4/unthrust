import { Icon } from "../";
import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import styles from './Menu.module.css';
import useUserData from "../../hooks/useUserData";

const Menu = () => {
    const { menu, setMenu } = useUserData();
    if (!menu) return null;

    const { event, items } = menu;

    const [positions, setPositions] = useState({});
    const [parent, setParent] = useState(null);
    const [container, setContainer] = useState(null);
    const [active, setActive] = useState(null);

    const menuItems = items.filter((item) => item.name !== "Divider");

    const containerRef = useCallback(node => {
        if (node !== null) {
            setParent(node.parentElement);
            setContainer({
                width: node.offsetWidth,
                height: node.offsetHeight,
                rect: node.getBoundingClientRect(),
            });
        }
    }, [event]);

    useEffect(() => {
        if (!parent || !container) return;

        let pos = {}

        // If there's not enough space to the right, open to the left
        if (window.innerWidth - 10 - event.clientX < container.width) {
            pos = {
                top: event.clientY,
                left: event.clientX - container.width,
            };
        } else {
            pos = {
                top: event.clientY,
                left: event.clientX,
            };
        }

        // If there's not enough space to the bottom, open to the top
        if (window.innerHeight - 10 - event.clientY < container.height) {
            pos = {
                ...pos,
                bottom: 10,
                top: "unset",
            };
        }

        setPositions(pos);
    }, [parent, container, container?.width]);

    useEffect(() => {
        if (!parent || !container) return;

        const handleClickOutside = (e) => {
            if (e.clientX === event.clientX) return;
            setMenu(null);
        };

        const handlekeyDown = (e) => {
            if (e.key === "Escape") {
                setMenu(null);
            } else if (e.key === "ArrowDown") {
                if (active === null) {
                    setActive(menuItems[0].name);
                } else {
                    const index = menuItems.findIndex((item) => item.name === active);
                    if (index < menuItems.length - 1) {
                        setActive(menuItems[index + 1].name);
                    } else {
                        setActive(menuItems[0].name);
                    }
                }
            } else if (e.key === "ArrowUp") {
                if (active === null) {
                    setActive(menuItems[menuItems.length - 1].name);
                } else {
                    const index = menuItems.findIndex((item) => item.name === active);
                    if (index > 0) {
                        setActive(menuItems[index - 1].name);
                    } else {
                        setActive(menuItems[menuItems.length - 1].name);
                    }
                }
            } else if (e.key === "Enter") {
                if (active) {
                    setMenu(null);
                    menuItems.find((item) => item.name === active).func();
                }
            }
        };

        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handlekeyDown);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handlekeyDown);
        };
    }, [parent, active]);

    return (
        <div
            ref={containerRef}
            className={styles.menuContainer}
            style={{
                ...positions,
                opacity: (container && positions.top) ? 1 : 0,
            }}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onContextMenu={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onMouseEnter={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onMouseLeave={() => setActive(null)}
        >
            <div>
                {items?.map((item) => (
                    item.name === "Divider" ? (
                        <div key={uuidv4()} className={styles.divider}></div>
                    ) : (
                        <div
                            key={uuidv4()}
                            className={item.danger
                                ? styles.menuItemDanger
                                : styles.menuItem
                            }
                            onClick={() => {
                                setMenu(null);
                                item.func();
                            }}
                            onMouseEnter={() => setActive(item.name)}
                            style={{
                                color: active === item.name
                                    ? "var(--foreground-1)"
                                    : item.danger ? "var(--error-1)" : "var(--foreground-3)",
                                backgroundColor: active === item.name
                                    ? item.danger ? "var(--error-1)" : "var(--accent-1)"
                                    : "transparent",
                            }}
                        >
                            <div className={styles.label}>
                                {item.name}
                            </div>

                            {item.icon && (
                                <div className={styles.icon}>
                                    <Icon
                                        name={item.icon}
                                        size={item.iconSize ?? 16}
                                        fill={active === item.name ? "var(--foreground-1)" : ""}
                                    />
                                </div>
                            )}
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

export default Menu;
