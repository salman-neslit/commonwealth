import * as core from '@hicommonwealth/core';
import {
  AuthStrategies,
  Events,
  INVALID_ACTOR_ERROR,
  INVALID_INPUT_ERROR,
  type CommandMetadata,
  type EventSchemas,
  type EventsHandlerMetadata,
  type QueryMetadata,
} from '@hicommonwealth/core';
import { TRPCError, initTRPC } from '@trpc/server';
import { Request } from 'express';
import passport from 'passport';
import { type OpenApiMeta } from 'trpc-swagger';
import { ZodSchema, ZodUndefined, z } from 'zod';
import { config } from '../config';

export interface Context {
  req: Request;
}

const trpc = initTRPC.meta<OpenApiMeta>().context<Context>().create();

const authenticate = async (
  req: Request,
  authStrategy: AuthStrategies = { name: 'jwt' },
) => {
  try {
    if (authStrategy.name === 'authtoken') {
      switch (req.headers['authorization']) {
        case config.NOTIFICATIONS.KNOCK_AUTH_TOKEN:
          req.user = {
            id: authStrategy.userId,
            email: 'hello@knock.app',
          };
          break;
        case config.LOAD_TESTING.AUTH_TOKEN:
          req.user = {
            id: authStrategy.userId,
            email: 'info@grafana.com',
          };
          break;
        default:
          throw new Error('Not authenticated');
      }
    } else if (authStrategy.name === 'custom') {
      authStrategy.customStrategyFn(req);
      req.user = {
        id: authStrategy.userId,
      };
    } else {
      await passport.authenticate(authStrategy.name, { session: false });
    }

    if (!req.user) throw new Error('Not authenticated');
    if (
      authStrategy.userId &&
      (req.user as core.User).id !== authStrategy.userId
    ) {
      throw new Error('Not authenticated');
    }
  } catch (error) {
    throw new TRPCError({
      message: error instanceof Error ? error.message : (error as string),
      code: 'UNAUTHORIZED',
    });
  }
};

const trpcerror = (error: unknown): TRPCError => {
  if (error instanceof Error) {
    const { name, message, ...other } = error;
    switch (name) {
      case INVALID_INPUT_ERROR:
        return new TRPCError({ code: 'BAD_REQUEST', message, ...other });

      case INVALID_ACTOR_ERROR:
        return new TRPCError({ code: 'UNAUTHORIZED', message });

      default:
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message,
          cause: error,
        });
    }
  }
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Oops, something went wrong!',
  });
};

export enum Tag {
  User = 'User',
  Community = 'Community',
  Thread = 'Thread',
  Comment = 'Comment',
  Reaction = 'Reaction',
  Integration = 'Integration',
  Subscription = 'Subscription',
  LoadTest = 'LoadTest',
}

export const command = <
  Input extends core.CommandInput,
  Output extends ZodSchema,
>(
  factory: () => CommandMetadata<Input, Output>,
  tag: Tag,
) => {
  const md = factory();
  return trpc.procedure
    .meta({
      openapi: {
        method: 'POST',
        path: `/${factory.name}/{id}`,
        tags: [tag],
        headers: [
          {
            in: 'header',
            name: 'address_id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        protect: md.secure,
      },
    })
    .input(md.input)
    .output(md.output)
    .mutation(async ({ ctx, input }) => {
      // md.secure must explicitly be false if the route requires no authentication
      // if we provide any authorization method we force authentication as well
      if (md.secure !== false || md.auth?.length)
        await authenticate(ctx.req, md.authStrategy);
      try {
        return await core.command(
          md,
          {
            actor: {
              user: ctx.req.user as core.User,
              // TODO: get from JWT?
              address_id: ctx.req.headers['address_id'] as string,
            },
            payload: input!,
          },
          false,
        );
      } catch (error) {
        throw trpcerror(error);
      }
    });
};

// TODO: add security options (API key, IP range, internal, etc)
export const event = <
  Input extends EventSchemas,
  Output extends ZodSchema | ZodUndefined = ZodUndefined,
>(
  factory: () => EventsHandlerMetadata<Input, Output>,
  tag: Tag.Integration,
) => {
  const md = factory();
  return trpc.procedure
    .meta({
      openapi: {
        method: 'POST',
        path: `/${factory.name}`,
        tags: [tag],
      },
    })
    .input(z.object(md.inputs))
    .output(md.output ?? z.object({}).optional())
    .mutation(async ({ input }) => {
      try {
        const [[name, payload]] = Object.entries(input as object);
        return await core.handleEvent(
          md,
          { name: name as Events, payload },
          false,
        );
      } catch (error) {
        throw trpcerror(error);
      }
    });
};

export const query = <Input extends ZodSchema, Output extends ZodSchema>(
  factory: () => QueryMetadata<Input, Output>,
  tag: Tag,
) => {
  const md = factory();
  return trpc.procedure
    .meta({
      openapi: {
        method: 'GET',
        path: `/${factory.name}`,
        tags: [tag],
        headers: [
          {
            in: 'header',
            name: 'address_id',
            required: false,
            schema: { type: 'string' },
          },
        ],
      },
      protect: md.secure,
    })
    .input(md.input)
    .output(md.output)
    .query(async ({ ctx, input }) => {
      // enable secure by default
      if (md.secure !== false) await authenticate(ctx.req, md.authStrategy);
      try {
        return await core.query(
          md,
          {
            actor: {
              user: ctx.req.user as core.User,
              address_id: ctx.req.headers['address_id'] as string,
            },
            payload: input!,
          },
          false,
        );
      } catch (error) {
        throw trpcerror(error);
      }
    });
};

export const router = trpc.router;
