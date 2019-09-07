import React, { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import { useDebouncedCallback } from "use-debounce";

const Item = props => {
  const { theme, item: { label, to, icon: Icon, children } = {}, onClick } = props;
  const [showChildPages, setShowChildPages] = useState(false);
  const [debouncedCallback] = useDebouncedCallback(val => setShowChildPages(val), 100);
  const [pageCoords, setPageCoords] = useState({});

  return (
    <Fragment>
      <li className={"hiddenItem" in props ? "hiddenItem" : "item"} key={label}>
        <Link
          to={to}
          className={"hiddenItem" in props ? "inHiddenItem" : ""}
          onClick={onClick}
          onMouseEnter={e => {
            e.persist();
            setPageCoords(() => {
              const { x, y } = e.target.getBoundingClientRect();
              return { left: x + 24, top: y + 48 };
            });
            setShowChildPages(true);
          }}
          data-slug={to}
        >
          {Icon && <Icon />} {label}
        </Link>
        {showChildPages &&
          children &&
          !!children.length && (
            <ul className="childPages" onMouseLeave={() => debouncedCallback(false)}>
              {children.map(child => (
                <li key={child.label}>
                  <Link to={child.to} className="item" onClick={onClick} data-slug={child.to}>
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
      </li>

      {/* --- STYLES --- */}
      <style jsx>{`
        .item,
        .showItem {
          background: transparent;
          transition: all ${theme.time.duration.default};
          display: flex;
          align-items: center;

          :global(a) {
            padding: ${theme.space.inset.s};
            display: flex;
            align-items: center;
          }

          :global(svg) {
            margin: 0 ${theme.space.inset.xs} 0 0;
            opacity: 0.3;
          }
        }

        :global(.itemList .hideItem) {
          display: none;
        }

        @from-width desktop {
          .childPages {
            position: fixed;
            top: ${pageCoords.top}px;
            list-style: none;
            transform: skewX(10deg);
            left: ${pageCoords.left}px;

            :global(.homepage):not(.fixed) & {
              &:after {
                border-left: 1px solid transparent;
                border-right: 1px solid transparent;
                background: color(white alpha(-10%));
              }
            }

            :global(.fixed) & {
              background: ${theme.background.color.primary};
              border: 1px solid ${theme.line.color};
              padding: ${theme.space.m};
              border-radius: ${theme.size.radius.small};
            }
          }

          .item {
            :global(a) {
              color: ${theme.text.color.primary};
              padding: ${theme.space.inset.s};
              transition: all ${theme.time.duration.default};
              border-radius: ${theme.size.radius.small};
            }

            :global(.homepage):not(.fixed) & :global(a) {
              color: ${theme.color.neutral.white};
            }

            :global(a:hover) {
              color: ${theme.color.brand.primary};
              background: color(white alpha(-60%));
            }

            :global(svg) {
              transition: all ${theme.time.duration.default};
            }

            &:hover :global(svg) {
              fill: ${theme.color.brand.primary};
              opacity: 1;

              :global(.hero) & :global(svg) {
                fill: green;
              }
            }
          }

          .showItem {
            display: none;
          }

          .hiddenItem {
            text-align: left;
            padding: ${theme.space.xs};

            & :global(a.inHiddenItem) {
              color: ${theme.text.color.primary};
              &:hover {
                color: ${theme.color.brand.primary};
              }
            }
          }
        }
      `}</style>
    </Fragment>
  );
};

Item.propTypes = {
  item: PropTypes.object,
  hidden: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.func,
  theme: PropTypes.object.isRequired
};

export default Item;
