import { Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { createApp } from './src/main';

let server: Handler;

const bootstrap = async (): Promise<Handler> => {
  const app = await createApp();
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
};

export const handler: Handler = async (event, context) => {
  server = server ?? (await bootstrap());
  return server(event, context);
};
