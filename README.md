# Ansuz logger

The logger service used in Ansuz internal projects.

# Usage

## Request and error logger

```javascript
import express from "express";
import {requestLogger, errorLogger} from "@ansuzdev/logger";

const app = express();

// Set request logger
app.use(requestLogger);

app.use("/", indexRouter);

// Set error logger
app.use(errorLogger);
```

## Debug logger

```javascript
import logger from "@ansuzdev/logger";

// Write debug-level log
logger.debug("Log something for debug");

// Write info-level log
logger.info("Log something for info");
```

Check [https://github.com/winstonjs/winston](https://github.com/winstonjs/winston) for details

# Log directories

There're maximum 15 log files per directory.

```
<root project>
|_logs
  |_debug
  | |_debug-YYYY-MM-DD.log
  | |_...
  |_error
  | |_error-YYYY-MM-DD.log
  | |_...
  |_request
    |_request-YYYY-MM-DD.log
    |_...
```
