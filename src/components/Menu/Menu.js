import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
require("core-js/fn/array/from");

import { FaAngleDown, FaHome } from "react-icons/fa/";

import Item from "./Item";
import Expand from "./Expand";

class Menu extends Component {
  constructor(props) {
    super(props);
    this.itemList = React.createRef();

    this.items = this.processPages(this.props.pages);

    this.renderedItems = []; // will contain references to rendered DOM elements of menu
  }

  state = {
    open: false,
    hiddenItems: []
  };

  static propTypes = {
    path: PropTypes.string.isRequired,
    fixed: PropTypes.bool.isRequired,
    screenWidth: PropTypes.number.isRequired,
    fontLoaded: PropTypes.bool.isRequired,
    pages: PropTypes.array.isRequired,
    theme: PropTypes.object.isRequired
  };

  componentDidMount() {
    this.renderedItems = this.getRenderedItems();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.path !== prevProps.path ||
      this.props.fixed !== prevProps.fixed ||
      this.props.screenWidth !== prevProps.screenWidth ||
      this.props.fontLoaded !== prevProps.fontLoaded
    ) {
      if (this.props.path !== prevProps.path) {
        this.closeMenu();
      }
      this.hideOverflowedMenuItems();
    }
  }

  processPages = p => {
    let pages = p.filter(topLevelPage => topLevelPage.node.parent_element === null);
    pages.sort((a, b) => a.node.menu_order - b.node.menu_order);
    pages = pages.map(page => {
      const children = p
        .filter(pageChildren => {
          const parentUrl = page.node.path.match(/\/.+$/);
          return pageChildren.node.path.match(parentUrl) && pageChildren.node.parent_element;
        })
        .sort((a, b) => a.node.menu_order - b.node.menu_order);
      let icon = null;
      if (page.node.title === "Home") {
        icon = FaHome;
      } else if (children.length) {
        icon = FaAngleDown;
      }
      return {
        to: page.node.path,
        label: page.node.title,
        icon,
        children: children.map(child => ({
          to: child.node.path,
          label: child.node.title,
          icon: null
        }))
      };
    });
    return pages;
  };

  getRenderedItems = () => {
    const itemList = this.itemList.current;
    return Array.from(itemList.children);
  };

  hideOverflowedMenuItems = () => {
    const PADDING_AND_SPACE_FOR_MORELINK = this.props.screenWidth >= 1024 ? 60 : 0;

    const itemsContainer = this.itemList.current;
    const maxWidth = itemsContainer.offsetWidth - PADDING_AND_SPACE_FOR_MORELINK;

    this.setState({ hiddenItems: [] }); // clears previous state

    const menu = this.renderedItems.reduce(
      (result, item) => {
        item.classList.add("item");
        item.classList.remove("hideItem");

        const currentCumulativeWidth = result.cumulativeWidth + item.offsetWidth;
        result.cumulativeWidth = currentCumulativeWidth;

        if (!item.classList.contains("more") && currentCumulativeWidth > maxWidth) {
          const link = item.querySelector("a");

          item.classList.add("hideItem");
          item.classList.remove("item");
          result.hiddenItems.push({
            to: link.getAttribute("data-slug"),
            label: link.text
          });
        }
        return result;
      },
      { visibleItems: [], cumulativeWidth: 0, hiddenItems: [] }
    );

    this.setState(prevState => ({ hiddenItems: menu.hiddenItems }));
  };

  toggleMenu = e => {
    e.preventDefault();

    if (this.props.screenWidth < 1024) {
      this.renderedItems.map(item => {
        const oldClass = this.state.open ? "showItem" : "hideItem";
        const newClass = this.state.open ? "hideItem" : "showItem";

        if (item.classList.contains(oldClass)) {
          item.classList.add(newClass);
          item.classList.remove(oldClass);
        }
      });
    }

    this.setState(prevState => ({ open: !prevState.open }));
  };

  closeMenu = e => {
    //e.preventDefault();

    if (this.state.open) {
      this.setState({ open: false });
      if (this.props.screenWidth < 1024) {
        this.renderedItems.map(item => {
          if (item.classList.contains("showItem")) {
            item.classList.add("hideItem");
            item.classList.remove("item");
          }
        });
      }
    }
  };

  render() {
    const { screenWidth, theme } = this.props;
    const { open } = this.state;

    return (
      <Fragment>
        <nav className={`menu ${open ? "open" : ""}`} rel="js-menu">
          <ul className="itemList" ref={this.itemList}>
            {this.items.map(item => (
              <Item item={item} key={item.label} icon={item.icon} theme={theme} />
            ))}
          </ul>
          {this.state.hiddenItems.length > 0 && <Expand onClick={this.toggleMenu} theme={theme} />}
          {open &&
            screenWidth >= 1024 && (
              <ul className="hiddenItemList">
                {this.state.hiddenItems.map(item => (
                  <Item item={item} key={item.label} hiddenItem theme={theme} />
                ))}
              </ul>
            )}
        </nav>

        {/* --- STYLES --- */}
        <style jsx>{`
          .menu {
            align-items: center;
            background: ${theme.color.neutral.white};
            bottom: 0;
            display: flex;
            flex-grow: 1;
            left: 0;
            max-height: ${open ? "1000px" : "50px"};
            padding: 0 ${theme.space.inset.s};
            position: fixed;
            width: 100%;
            z-index: 100;
            transition: all ${theme.time.duration.default};
          }

          .itemList {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            list-style: none;
            margin: 0;
            padding: 0; /* 0 ${theme.space.s}; */
            position: relative;
            width: 100%;
          }

          @below desktop {
            .menu {
              &::after {
                position: absolute;
                content: "";
                left: ${theme.space.m};
                right: ${theme.space.m};
                top: 0;
                height: 1px;
                background: ${theme.color.brand.primary};
                z-index: 100;
              }

              &.open {
                padding: ${theme.space.inset.m};
              }

              :global(.homepage):not(.fixed) & {
                bottom: -100px;
              }
            }
          }

          @from-width desktop {
            .menu {
              border-top: none;
              background: transparent;
              display: flex;
              position: relative;
              justify-content: flex-end;
              padding-left: 50px;
              transition: none;
              z-index: 100;
            }

            .itemList {
              justify-content: flex-end;
              padding: 0;
            }

            .hiddenItemList {
              list-style: none;
              margin: 0;
              position: absolute;
              background: ${theme.background.color.primary};
              border: 1px solid ${theme.line.color};
              top: 48px;
              right: ${theme.space.s};
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              padding: ${theme.space.m};
              border-radius: ${theme.size.radius.small};
              border-top-right-radius: 0;


              &:after {
                content: "";
                background: ${theme.background.color.primary};
                z-index: 20;
                top: -10px;
                right: -1px;
                width: 44px;
                height: 10px;
                position: absolute;
                border-left: 1px solid ${theme.line.color};
                border-right: 1px solid ${theme.line.color};
              }

              :global(.homepage):not(.fixed) & {
                border: 1px solid transparent;
                background: color(white alpha(-10%));
                top: 50px;

                &:after {
                  top: -11px;
                  border-left: 1px solid transparent;
                  border-right: 1px solid transparent;
                  background: color(white alpha(-10%));
                }
              }

              :global(.fixed) & {
                top: 44px;
              }
            }
          }
        `}</style>
      </Fragment>
    );
  }
}

export default Menu;
