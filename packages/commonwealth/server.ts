import bodyParser from 'body-parser';
import {
  getRabbitMQConfig,
  RabbitMQController,
} from 'common-common/src/rabbitmq';
import { StatsDController } from 'common-common/src/statsd';
import compression from 'compression';
import SessionSequelizeStore from 'connect-session-sequelize';
import cookieParser from 'cookie-parser';
import express from 'express';
import { redirectToHTTPS } from 'express-http-to-https';
import session from 'express-session';
import fs from 'fs';
import logger from 'morgan';
import passport from 'passport';
import prerenderNode from 'prerender-node';
import type { BrokerConfig } from 'rascal';
import Rollbar from 'rollbar';
import favicon from 'serve-favicon';
import { TokenBalanceCache } from 'token-balance-cache/src/index';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import setupErrorHandlers from '../common-common/src/scripts/setupErrorHandlers';
import {
  RABBITMQ_URI,
  ROLLBAR_ENV,
  ROLLBAR_SERVER_TOKEN,
  SESSION_SECRET,
} from './server/config';
import models from './server/database';
import DatabaseValidationService from './server/middleware/databaseValidationService';
import setupPassport from './server/passport';
import { addSwagger } from './server/routing/addSwagger';
import { addExternalRoutes } from './server/routing/external';
import setupAPI from './server/routing/router';
import { sendBatchedNotificationEmails } from './server/scripts/emails';
import setupAppRoutes from './server/scripts/setupAppRoutes';
import expressStatsdInit from './server/scripts/setupExpressStats';
import setupPrerenderServer from './server/scripts/setupPrerenderService';
import setupServer from './server/scripts/setupServer';
import BanCache from './server/util/banCheckCache';
import setupCosmosProxy from './server/util/cosmosProxy';
import setupCEProxy from './server/util/entitiesProxy';
import GlobalActivityCache from './server/util/globalActivityCache';
import setupIpfsProxy from './server/util/ipfsProxy';
import ViewCountCache from './server/util/viewCountCache';
import devWebpackConfig from './webpack/webpack.dev.config.js';
import prodWebpackConfig from './webpack/webpack.prod.config.js';
import * as v8 from 'v8';
import { factory, formatFilename } from 'common-common/src/logging';

const log = factory.getLogger(formatFilename(__filename));
// set up express async error handling hack
require('express-async-errors');

const app = express();

log.info(
  `Node Option max-old-space-size set to: ${JSON.stringify(
    v8.getHeapStatistics().heap_size_limit / 1000000000
  )} GB`
);

async function main() {
  const DEV = process.env.NODE_ENV !== 'production';

  // CLI parameters for which task to run
  const SHOULD_SEND_EMAILS = process.env.SEND_EMAILS === 'true';
  const SHOULD_ADD_MISSING_DECIMALS_TO_TOKENS =
    process.env.SHOULD_ADD_MISSING_DECIMALS_TO_TOKENS === 'true';

  const NO_TOKEN_BALANCE_CACHE = process.env.NO_TOKEN_BALANCE_CACHE === 'true';
  const NO_GLOBAL_ACTIVITY_CACHE =
    process.env.NO_GLOBAL_ACTIVITY_CACHE === 'true';
  const NO_CLIENT_SERVER =
    process.env.NO_CLIENT === 'true' ||
    SHOULD_SEND_EMAILS ||
    SHOULD_ADD_MISSING_DECIMALS_TO_TOKENS;

  const tokenBalanceCache = new TokenBalanceCache();
  await tokenBalanceCache.initBalanceProviders();
  let rc = null;
  if (SHOULD_SEND_EMAILS) {
    rc = await sendBatchedNotificationEmails(models);
  }

  // exit if we have performed a one-off event
  if (rc !== null) {
    process.exit(rc);
  }

  const WITH_PRERENDER = process.env.WITH_PRERENDER;
  const NO_PRERENDER = process.env.NO_PRERENDER || NO_CLIENT_SERVER;

  const compiler = DEV
    ? webpack(devWebpackConfig as any)
    : webpack(prodWebpackConfig as any);
  const SequelizeStore = SessionSequelizeStore(session.Store);
  const devMiddleware =
    DEV && !NO_CLIENT_SERVER
      ? webpackDevMiddleware(compiler as any, {
          publicPath: '/build',
        })
      : null;
  const viewCountCache = new ViewCountCache(2 * 60, 10 * 60);

  const sessionStore = new SequelizeStore({
    db: models.sequelize,
    tableName: 'Sessions',
    checkExpirationInterval: 15 * 60 * 1000, // Clean up expired sessions every 15 minutes
    expiration: 7 * 24 * 60 * 60 * 1000, // Set session expiration to 7 days
  });

  sessionStore.sync();

  const setupMiddleware = () => {
    // redirect from commonwealthapp.herokuapp.com to commonwealth.im
    app.all(/.*/, (req, res, next) => {
      const host = req.header('host');
      const origin = req.get('origin');

      // Log the request method, url and origin
      console.log(`Request method: ${req.method}`);
      console.log(`Request URL: ${req.url}`);
      console.log(`Request Origin: ${origin}`);

      // if host is native mobile app, don't redirect
      if (origin?.includes('capacitor://')) {
        console.log('Request from Capacitor. Applying special sessionParser.');

        res.header('Access-Control-Allow-Origin', origin);
        // Set other necessary CORS headers if needed
        res.header(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS'
        );
        res.header(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization'
        );
        res.header('Access-Control-Allow-Credentials', 'true');

        // For development only - need to figure out prod solution
        const sessionParserForCapacitor = session({
          secret: SESSION_SECRET,
          store: sessionStore,
          resave: false,
          saveUninitialized: false,
          cookie: {
            sameSite: 'none',
            secure: process.env.NODE_ENV === 'production' ? true : false,
            httpOnly: false,
          },
        });

        return sessionParserForCapacitor(req, res, next);
      }

      if (host?.match(/commonwealthapp.herokuapp.com/i)) {
        console.log(
          'Redirecting from commonwealthapp.herokuapp.com to commonwealth.im.'
        );
        res.redirect(301, `https://commonwealth.im${req.url}`);
      } else {
        console.log(
          'Not from Capacitor or commonwealthapp.herokuapp.com. Using default sessionParser.'
        );
        const defaultSessionParser = session({
          secret: SESSION_SECRET,
          store: sessionStore,
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: process.env.NODE_ENV === 'production' ? true : false,
            httpOnly: true,
          },
        });
        defaultSessionParser(req, res, next);
      }
    });

    // redirect to https:// unless we are using a test domain or using 192.168.1.range (local network range)
    app.use(
      redirectToHTTPS(
        [
          /localhost:(\d{4})/,
          /127.0.0.1:(\d{4})/,
          /192.168.1.(\d{1,3}):(\d{4})/,
        ],
        [],
        301
      )
    );

    // dynamic compression settings used
    app.use(compression());

    // static compression settings unused
    // app.get('*.js', (req, res, next) => {
    //   req.url = req.url + '.gz';
    //   res.set('Content-Encoding', 'gzip');
    //   res.set('Content-Type', 'application/javascript; charset=UTF-8');
    //   next();
    // });

    // // static compression settings unused
    // app.get('bundle.**.css', (req, res, next) => {
    //   req.url = req.url + '.gz';
    //   res.set('Content-Encoding', 'gzip');
    //   res.set('Content-Type', 'text/css');
    //   next();
    // });

    // serve the compiled app
    if (!NO_CLIENT_SERVER) {
      if (DEV) {
        app.use(devMiddleware);
        app.use(webpackHotMiddleware(compiler));
      } else {
        app.use('/build', express.static('build'));
      }
    }

    // add security middleware
    app.use(function applyXFrameAndCSP(req, res, next) {
      res.set('X-Frame-Options', 'DENY');
      res.set('Content-Security-Policy', "frame-ancestors 'none';");
      next();
    });

    // serve static files
    app.use(favicon(`${__dirname}/favicon.ico`));
    app.use('/static', express.static('static'));

    // add other middlewares
    app.use(logger('dev'));
    app.use(expressStatsdInit(StatsDController.get()));
    app.use(bodyParser.json({ limit: '1mb' }));
    app.use(bodyParser.urlencoded({ limit: '1mb', extended: false }));
    app.use(cookieParser());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(prerenderNode.set('prerenderServiceUrl', 'http://localhost:3000'));
  };

  const templateFile = (() => {
    try {
      return fs.readFileSync('./build/index.html');
    } catch (e) {
      console.error(`Failed to read template file: ${e.message}`);
    }
  })();

  const sendFile = (res) => res.sendFile(`${__dirname}/build/index.html`);

  // Only run prerender in DEV environment if the WITH_PRERENDER flag is provided.
  // On the other hand, run prerender by default on production.
  if (DEV) {
    if (WITH_PRERENDER) setupPrerenderServer();
  } else {
    if (!NO_PRERENDER) setupPrerenderServer();
  }

  setupMiddleware();
  setupPassport(models);

  const rollbar = new Rollbar({
    accessToken: ROLLBAR_SERVER_TOKEN,
    environment: ROLLBAR_ENV,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  let rabbitMQController: RabbitMQController;
  try {
    rabbitMQController = new RabbitMQController(
      <BrokerConfig>getRabbitMQConfig(RABBITMQ_URI)
    );
    await rabbitMQController.init();
  } catch (e) {
    console.warn(
      'The main service RabbitMQController failed to initialize!',
      e
    );
    rollbar.critical(
      'The main service RabbitMQController failed to initialize!',
      e
    );
  }

  if (!rabbitMQController.initialized) {
    console.warn(
      'The RabbitMQController is not initialized! Some services may be unavailable e.g.' +
        ' (Create/Delete chain and Websocket notifications)'
    );
    rollbar.critical('The main service RabbitMQController is not initialized!');
    // TODO: this requires an immediate response if in production
  }

  if (!NO_TOKEN_BALANCE_CACHE) await tokenBalanceCache.start();
  const banCache = new BanCache(models);
  const globalActivityCache = new GlobalActivityCache(models);

  // initialize async to avoid blocking startup
  if (!NO_GLOBAL_ACTIVITY_CACHE) globalActivityCache.start();

  // Declare Validation Middleware Service
  // middleware to use for all requests
  const dbValidationService: DatabaseValidationService =
    new DatabaseValidationService(models);

  setupAPI(
    '/api',
    app,
    models,
    viewCountCache,
    tokenBalanceCache,
    banCache,
    globalActivityCache,
    dbValidationService
  );

  // new API
  addExternalRoutes('/external', app, models, tokenBalanceCache);
  addSwagger('/docs', app);

  setupCosmosProxy(app, models);
  setupIpfsProxy(app);
  setupCEProxy(app);
  setupAppRoutes(app, models, devMiddleware, templateFile, sendFile);

  setupErrorHandlers(app, rollbar);

  setupServer(app, rollbar, models, rabbitMQController);
}

main().catch((e) => console.log(e));
export default app;
