import PropTypes from "prop-types";
import React, { Component, Fragment } from "react";
import { graphql } from "gatsby";
import { ThemeContext } from "../layouts";
import Article from "../components/Article";
import Page from "../components/Page";
import Hero from "../components/Hero";
import Seo from "../components/Seo";

class IndexPage extends Component {
  separator = React.createRef();

  scrollToContent = e => {
    this.separator.current.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  render() {
    const {
      data: {
        wordpressPage: indexPage,
        bgDesktop: {
          resize: { src: desktop }
        },
        bgTablet: {
          resize: { src: tablet }
        },
        bgMobile: {
          resize: { src: mobile }
        },
        site: {
          siteMetadata: { facebook }
        },
        carousel: { edges: carousel }
      }
    } = this.props;

    const backgrounds = {
      carousel,
      desktop,
      tablet,
      mobile
    };

    return (
      <Fragment>
        <ThemeContext.Consumer>
          {theme => (
            <Hero scrollToContent={this.scrollToContent} backgrounds={backgrounds} theme={theme} />
          )}
        </ThemeContext.Consumer>

        <hr ref={this.separator} />

        <ThemeContext.Consumer>
          {theme => (
            <Article theme={theme}>
              <Page page={indexPage} theme={theme} />
            </Article>
          )}
        </ThemeContext.Consumer>

        <Seo facebook={facebook} />

        <style jsx>{`
          hr {
            margin: 0;
            border: 0;
          }
        `}</style>
      </Fragment>
    );
  }
}

IndexPage.propTypes = {
  data: PropTypes.object.isRequired
};

export default IndexPage;

//eslint-disable-next-line no-undef
export const query = graphql`
  query IndexQuery {
    wordpressPage(path: { regex: "/^/$/" }) {
      content
      title
    }
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
    bgDesktop: imageSharp(fluid: { originalName: { regex: "/hero-background/" } }) {
      resize(width: 1200, quality: 90, cropFocus: CENTER) {
        src
      }
    }
    bgTablet: imageSharp(fluid: { originalName: { regex: "/hero-background/" } }) {
      resize(width: 800, height: 1100, quality: 90, cropFocus: CENTER) {
        src
      }
    }
    bgMobile: imageSharp(fluid: { originalName: { regex: "/hero-background/" } }) {
      resize(width: 450, height: 850, quality: 90, cropFocus: CENTER) {
        src
      }
    }
    carousel: allImageSharp(filter: { fluid: { originalName: { regex: "/zdenek/" } } }) {
      edges {
        node {
          resize(width: 1200, quality: 90, cropFocus: CENTER) {
            src
          }
          id
        }
      }
    }
  }
`;
