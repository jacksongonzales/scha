const _ = require("lodash");
const path = require(`path`);
const slash = require(`slash`);
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode });
    const fileNode = getNode(node.parent);
    const source = fileNode.sourceInstanceName;
    const separtorIndex = ~slug.indexOf("--") ? slug.indexOf("--") : 0;
    const shortSlugStart = separtorIndex ? separtorIndex + 2 : 0;

    if (source !== "parts") {
      createNodeField({
        node,
        name: `slug`,
        value: `${separtorIndex ? "/" : ""}${slug.substring(shortSlugStart)}`
      });
    }
    createNodeField({
      node,
      name: `prefix`,
      value: separtorIndex ? slug.substring(1, separtorIndex) : ""
    });
    createNodeField({
      node,
      name: `source`,
      value: source
    });
  }
};

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programmatically
// create pages.
// Will create pages for WordPress pages (route : /{slug})
// Will create pages for WordPress posts (route : /post/{slug})
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const categoryTemplate = path.resolve("./src/templates/CategoryTemplate.js");

  // Do not create draft post files in production.
  let activeEnv = process.env.ACTIVE_ENV || process.env.NODE_ENV || "development";
  console.log(`Using environment config: '${activeEnv}'`);
  let filters = `filter: { fields: { slug: { ne: null } } }`;
  if (activeEnv == "production")
    filters = `filter: { fields: { slug: { ne: null } , prefix: { ne: null } } }`;

  // The “graphql” function allows us to run arbitrary
  // queries against the local Gatsby GraphQL schema. Think of
  // it like the site has a built-in database constructed
  // from the fetched data that you can run queries against.
  const result = await graphql(
    `
    {
      allWordpressPage {
        edges {
          node {
            id
            slug
            path
            status
            template
          }
        }
      }
      allMarkdownRemark(
              ` +
      filters +
      `
              sort: { fields: [fields___prefix], order: DESC }
              limit: 1000
            ) {
              edges {
                node {
                  id
                  fields {
                    slug
                    prefix
                    source
                  }
                  frontmatter {
                    title
                    category
                  }
                }
              }
            }
    }
  `
  );

  // Check for any errors
  if (result.errors) {
    throw new Error(result.errors);
  }

  // Access query results via object destructuring
  const { allWordpressPage /*, allWordpressPost */ } = result.data;

  // Create Page pages.
  const pageTemplate = path.resolve(`./src/templates/PageTemplate.js`);
  // We want to create a detailed page for each page node.
  // The path field contains the relative original WordPress link
  // and we use it for the slug to preserve url structure.
  // The Page ID is prefixed with 'PAGE_'
  allWordpressPage.edges.forEach(edge => {
    // Gatsby uses Redux to manage its internal state.
    // Plugins and sites can use functions like "createPage"
    // to interact with Gatsby.
    createPage({
      // Each page is required to have a `path` as well
      // as a template component. The `context` is
      // optional but is often necessary so the template
      // can query data specific to each page.
      path: edge.node.path,
      component: slash(pageTemplate),
      context: {
        id: edge.node.id,
        slug: edge.node.slug
      }
    });
  });

  const postTemplate = path.resolve(`./src/templates/PostTemplate.js`);
  // We want to create a detailed page for each post node.
  // The path field stems from the original WordPress link
  // and we use it for the slug to preserve url structure.
  // The Post ID is prefixed with 'POST_'

  // TODO: how to display posts?
  // allWordpressPost.edges.forEach(edge => {
  // createPage({
  // path: edge.node.path,
  // component: slash(postTemplate),
  // context: {
  // id: edge.node.id,
  // slug: edge.node.slug
  // }
  // });
  // });
  const items = result.data.allMarkdownRemark.edges;

  // Create category list
  const categorySet = new Set();
  items.forEach(edge => {
    const {
      node: {
        frontmatter: { category }
      }
    } = edge;

    if (category && category !== null) {
      categorySet.add(category);
    }
  });

  // Create category pages
  const categoryList = Array.from(categorySet);
  categoryList.forEach(category => {
    createPage({
      path: `/category/${_.kebabCase(category)}/`,
      component: categoryTemplate,
      context: {
        category
      }
    });
  });

  // Create posts
  const posts = items.filter(item => item.node.fields.source === "posts");
  posts.forEach(({ node }, index) => {
    const slug = node.fields.slug;
    const next = index === 0 ? undefined : posts[index - 1].node;
    const prev = index === posts.length - 1 ? undefined : posts[index + 1].node;
    const source = node.fields.source;

    createPage({
      path: slug,
      component: postTemplate,
      context: {
        slug,
        prev,
        next,
        source
      }
    });
  });

  // and pages.
  const pages = items.filter(item => item.node.fields.source === "pages");
  pages.forEach(({ node }) => {
    const slug = node.fields.slug;
    const source = node.fields.source;

    createPage({
      path: slug,
      component: pageTemplate,
      context: {
        slug,
        source
      }
    });
  });
};

exports.onCreateWebpackConfig = ({ getConfig, stage, actions }, options) => {
  const config = getConfig();
  if (stage.startsWith("develop") && config.resolve) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-dom": "@hot-loader/react-dom"
    };
  }
  switch (stage) {
    case `build-javascript`:
      actions.setWebpackConfig({
        plugins: [
          new BundleAnalyzerPlugin({
            analyzerMode: "static",
            reportFilename: "./report/treemap.html",
            openAnalyzer: true,
            logLevel: "error",
            defaultSizes: "gzip"
          })
        ]
      });
  }
};
