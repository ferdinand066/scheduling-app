import { Server } from "@hapi/hapi";
import createShiftRoutes from "./shifts";
import createPublishWeekRoutes from "./publish-weeks";

export default function (server: Server, basePath: string) {
  createShiftRoutes(server, basePath + "/shifts");
  createPublishWeekRoutes(server, basePath + "/publish-weeks");
}
