import { Configuration, Inject, PlatformApplication } from "@tsed/common";
import { GlobalAcceptMimesMiddleware } from "@tsed/platform-express";
import * as bodyParser from "body-parser";
import * as compress from "compression";
import * as cookieParser from "cookie-parser";
import * as methodOverride from "method-override";
import * as express from 'express';
import * as path from 'path';
import "@tsed/swagger";
import * as cons from 'consolidate';
import * as morgan from 'morgan';
// app-specific stuff
import config from "./helpers/config";
import requestInterscept from './middleware/Any';
import { NotFoundMiddleware } from './middleware/ErrorHandle';
// Import games service and setup the client
import Games from './services/Games';
if (process.env.NODE_ENV !== 'production') {
    console.log('[info] start building game source');
    new Games().setupGameClient();
    console.log('[info] end building game source');
}

const rootDir = __dirname;
let portToListenOn = config.port || process.env.PORT || 3000;
console.log('[info] listening on port', portToListenOn);
@Configuration({
    rootDir,
    mount: {
        "/": [
            `${rootDir}/controllers/www/**/*.ts`
        ],
    },
    viewsDir: `${rootDir}/views`,
    acceptMimes: ["application/json"],
    port: portToListenOn,
    logger: {
        logEnd: false,
        logRequest: false,
        logStart: false,
    },
    componentsScan: [
        `${rootDir}/middleware/*.ts`
    ],
    httpsPort: false,
})
export class Server {
    @Inject()
    app: PlatformApplication;

    @Configuration()
    settings: Configuration;

    /**
     * This method let you configure the express middleware required by your application to works.
     * @returns {Server}
     */
    public $beforeRoutesInit(): void | Promise<any> {
        this.app.raw.set("views", this.settings.get("viewsDir"));
        this.app.raw.set('view engine', 'vash');
        this.app.raw.engine("vash", cons.vash);
        this.app
            .use(GlobalAcceptMimesMiddleware) // optional
            .use(methodOverride())
            .use(compress({}))

        // Dev env specific setup
        if (process.env.NODE_ENV === 'development') {
            this.app
                // Serve static on dev only (we use nginx for static serve in production)
                .use(express.static(path.join(__dirname, './public/')))
        }

        // Middleware is split down here so we dont make unnecessary requests for static files
        this.app
            .use(cookieParser())
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({
                extended: true
            }))
            .use(requestInterscept)

        if (process.env.NODE_ENV === 'development') {
            // this.app.use(morgan('dev'));
        } else {
            this.app.use(morgan('tiny'));
        }
    }

    $afterRoutesInit() {
        this.app.use(NotFoundMiddleware);
    }
}
