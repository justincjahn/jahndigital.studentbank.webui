module.exports = {
  client: {
    includes: [`${__dirname}/src/common/graphql/**/*.gql`],
    service: {
      name: 'studentbank-api',
      localSchemaFile: `${__dirname}/src/generated/schema.graphql`,
    },
  },
};
