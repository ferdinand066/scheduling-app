import { Server } from '@hapi/hapi';
import * as publishWeekController from './publishWeekController';
import { createPublishWeekDto, findPublishWeekQueryDto } from '../../../shared/dtos';

export default function (server: Server, basePath: string) {
  server.route({
    method: "GET",
    path: basePath,
    handler: publishWeekController.findByStartDate,
    options: {
      description: 'Get publish week by start date and end date',
      notes: 'Returns null if no publish week exists for the given date range',
      tags: ['api', 'publish-week'],
      validate: {
        query: findPublishWeekQueryDto
      },
    }
  });

  server.route({
    method: "POST",
    path: basePath,
    handler: publishWeekController.create,
    options: {
      description: 'Create publish week',
      notes: 'Create a new publish week',
      tags: ['api', 'publish-week'],
      validate: {
        payload: createPublishWeekDto
      },
    }
  });
}

