import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/generated/schema.graphql',
  documents: 'src/common/graphql/**/*.gql',
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'fragment-matcher'],
      config: {
        scalars: {
          Rate: 'number',
          Money: 'number',
          Decimal: 'number',
          Long: 'number',
          DateTime: 'string',
        },
      },
    },
  },
};

export default config;
