import React from "react";
import PropTypes from "prop-types";
import { graphql, StaticQuery } from "gatsby";

import Headline from "../Article/Headline";
import Bodytext from "../Article/Bodytext";
import { Timeline, TimelineItem } from "vertical-timeline-component-for-react";

const Page = props => {
  const {
    page: { content: html, title, slug },
    theme
  } = props;

  return (
    <React.Fragment>
      <header>
        <Headline title={title} theme={theme} />
      </header>
      {!/history/.test(slug) ? (
        <Bodytext html={html} theme={theme} />
      ) : (
        <StaticQuery
          query={graphql`
            query HistoryPosts {
              allWordpressPost(
                filter: { categories: { elemMatch: { slug: { regex: "/history/" } } } }
              ) {
                edges {
                  node {
                    slug
                    categories {
                      slug
                    }
                    content
                    date
                    title
                  }
                }
              }
            }
          `}
          render={data => (
            <Timeline lineColor={"#ddd"}>
              {data.allWordpressPost.edges.map(post => (
                <TimelineItem
                  key="001"
                  dateText={new Date(post.node.date).toDateString()}
                  style={{ color: "#e86971" }}
                >
                  <h3>{post.node.title}</h3>
                  <Bodytext html={post.node.content} theme={theme} />
                </TimelineItem>
              ))}
            </Timeline>
          )}
        />
      )}
    </React.Fragment>
  );
};

Page.propTypes = {
  data: PropTypes.object,
  page: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default Page;
