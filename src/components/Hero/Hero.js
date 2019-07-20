import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";

import Carousel, { Item, Caption } from "react-bootstrap/Carousel";
import { FaArrowDown } from "react-icons/fa/";

const Hero = props => {
  const { scrollToContent, backgrounds, theme } = props;

  return (
    <React.Fragment>
      {typeof window !== "undefined" && (
        <Carousel className="hero">
          {backgrounds.carousel.map(img => (
            <Item key={img.node.id}>
              <img src={img.node.resize.src} className="img" />
              <Caption>
                <h1>I got the horses in the back</h1>
                <button onClick={scrollToContent} aria-label="scroll">
                  <FaArrowDown />
                </button>
              </Caption>
            </Item>
          ))}
        </Carousel>
      )}

      {/* --- STYLES --- */}
      <style jsx>{`
        .img {
          width: 100%;
          height: 100%;
        }

        .hero {
          align-items: center;
          display: flex;
          flex-flow: column nowrap;
          justify-content: center;
          min-height: 100vh;
          height: 100vh;
          padding: ${theme.space.inset.l};
          padding-top: ${theme.header.height.homepage};
        }

        button {
          background: ${theme.background.color.brand};
          border: 0;
          border-radius: 50%;
          font-size: ${theme.font.size.m};
          padding: ${theme.space.s} ${theme.space.m};
          cursor: pointer;
          width: ${theme.space.xl};
          height: ${theme.space.xl};

          &:focus {
            outline-style: none;
            background: ${theme.color.brand.primary.active};
          }

          :global(svg) {
            position: relative;
            top: 5px;
            fill: ${theme.color.neutral.white};
            stroke-width: 40;
            stroke: ${theme.color.neutral.white};
            animation-duration: ${theme.time.duration.long};
            animation-name: buttonIconMove;
            animation-iteration-count: infinite;
          }
        }

        @keyframes buttonIconMove {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0);
          }
        }

        @from-width tablet {
          .hero {
            background-image: url(${backgrounds.tablet});
          }

          h1 {
            font-size: ${`calc(${theme.hero.h1.size} * 1.3)`};
          }

          button {
            font-size: ${theme.font.size.l};
          }
        }

        @from-width desktop {
          .hero {
            background-image: url(${backgrounds.desktop});
          }

          h1 {
            font-size: ${`calc(${theme.hero.h1.size} * 1.5)`};
          }

          button {
            font-size: ${theme.font.size.xl};
          }
        }
      `}</style>
    </React.Fragment>
  );
};

Hero.propTypes = {
  scrollToContent: PropTypes.func.isRequired,
  backgrounds: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default Hero;
