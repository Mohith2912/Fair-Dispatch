# FairDispatch

FairDispatch is a delivery-dispatch prototype for managing drivers, delivery stops, workloads, and support requests. This repository includes an Express REST API, a plain HTML/CSS/JavaScript manager dashboard branded **FairRoute AI**, an alternative Firebase server, and an experimental Python workload-balancing model.

**Start with `npm start` for the local API.** The dashboard runs separately and currently combines mock data with direct Firebase access; starting the API does not connect the dashboard to it automatically.

## Contents

- [Project components](#project-components)
- [Requirements](#requirements)
- [Local API setup](#local-api-setup)
- [Dashboard setup](#dashboard-setup)
- [API reference](#api-reference)
- [Example workflows](#example-workflows)
- [Data and fairness logic](#data-and-fairness-logic)
- [Alternative Firebase server](#alternative-firebase-server)
- [Optional model training](#optional-model-training)
- [Project structure](#project-structure)
- [Verification and troubleshooting](#verification-and-troubleshooting)
- [Deployment considerations](#deployment-considerations)
- [Contributing and license](#contributing-and-license)

## Project components

| Component | Entry point | Storage | Status |
| --- | --- | --- | --- |
| Local REST API | `src/index.js` via `npm start` | JSON files in `data/` | Default backend; no external service needed |
| Manager dashboard | `index.html` | Mock/in-memory data, browser local storage, selected Firebase paths | Prototype; known configuration gaps listed below |
| Alternative REST API | `server.js` via `node server.js` | Firebase Realtime Database | Separate endpoint contract; additional setup required |
| Training experiment | `train-rotation-model.py` | `models/rotation-model.joblib` | Standalone; not called by either server or dashboard |

The local API supports driver lookup/login, delivery-stop progress and feedback, load creation and automatic assignment, basic ETA estimates, and support-request/chat workflows. The dashboard includes assignments, live-fleet visualization, fairness monitoring/history, disputes, and order management. Several dashboard features use simulated data.

## Requirements

- **Node.js 20 or newer** and npm, as declared in `package.json`.
- Git to clone the repository.
- A browser for the dashboard. Its Firebase SDK, Leaflet, Chart.js, fonts, and map tiles use external services and require network access.
- Optional: Python 3 for model training or the static-server example below.
- Optional: a Firebase project with Realtime Database for Firebase-backed features.

The default API requires no database server, Firebase credentials, Google Maps key, Python installation, or build step.

## Local API setup

### 1. Get the project and install dependencies

```sh
git clone https://github.com/Mohith2912/Fair-Dispatch.git
cd Fair-Dispatch
npm ci
```

If you already have a checkout, open a terminal in its root directory and run `npm ci`. This installs dependencies from `package-lock.json`, including the development watcher.

### 2. Configure the port (optional)

Create a `.env` file at the repository root, or edit your existing one:

```dotenv
PORT=3001
```

| Setting | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | Listening port for `src/index.js` |

`PORT` is the only environment variable read by the application code. ETA uses a local distance calculation; `GOOGLE_MAPS_API_KEY` is not used. The repository ignores `.env` and does not include an `.env.example` file. Firebase browser settings live separately in `js/config.js`.

### 3. Start the API

```sh
npm start
```

For automatic restart after source changes:

```sh
npm run dev
```

The default base URL is `http://localhost:3001/api`. Stop the server with **Ctrl+C**.

### 4. Confirm it is running

Open [the health endpoint](http://localhost:3001/api/health), or run:

```sh
curl http://localhost:3001/api/health
```

Expected response shape:

```json
{ "status": "OK", "timestamp": "<ISO-8601 timestamp>" }
```

In Windows PowerShell, you can instead use:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

There is no page served at `/`: the default server serves API endpoints only.

## Dashboard setup

The dashboard has no bundler or npm build command. Serve the static files separately on localhost. For example, if Python is installed, run this from the repository root in another terminal:

```sh
python -m http.server 8080 --bind 127.0.0.1
```

On Windows, `py -m http.server 8080 --bind 127.0.0.1` is an alternative. Then open [the dashboard](http://localhost:8080).

This root-directory static server is for local development only: it can also serve backend files and local data. For hosting, publish only `index.html`, `css/`, and `js/` after addressing the limitations below.

### Dashboard login and data sources

The login handler accepts any nonempty username and password that pass the form's browser validation. It creates a dispatcher profile under the browser local-storage key `fairroute_user`. This is a demo login, not Firebase Authentication or the API's driver login.

Most views use generated data. Firebase-backed behavior includes:

| Firebase path | Use |
| --- | --- |
| `drivers` | Read by the rotation button |
| `routes` | Read by the rotation button; expected to be an array |
| `assignments/ai-rotation` | Replaced with the computed route assignments |
| `notifications/ai-complete` | Receives a completion notification record |
| `drivers/disputes` | Read by the disputes view through a child-added listener |

For your own Firebase environment, replace the `firebase` object in `js/config.js` with your project's web-app configuration and Realtime Database URL. The checked-in configuration points to an existing project; do not assume access to it.

Configure database access for your environment. The current dashboard does not sign in to Firebase, so database rules requiring authenticated access will reject these operations. Implement Firebase Authentication and suitable rules for a shared deployment; the local demo login does not authorize database access.

The following illustrates the shape expected by rotation code. Add these nodes only to a dedicated development database, without replacing unrelated existing data:

```json
{
  "drivers": {
    "D1": { "monthlyLoad": 45, "weeklyEffort": 65, "esp32Steps": 8500 },
    "D2": { "monthlyLoad": 75, "weeklyEffort": 55, "esp32Steps": 6200 }
  },
  "routes": [
    { "id": "R1", "difficulty": 80 },
    { "id": "R2", "difficulty": 30 }
  ]
}
```

Keep these driver metrics numeric and populated: missing values can produce `undefined` assignment fields and failed Firebase writes. The nested `drivers/disputes` path also shares the node that rotation treats as a driver collection; these schemas need reconciliation for combined use.

### Known dashboard gaps

- `index.html` references `js/pdf-export.js`, which is absent. PDF export is not a complete included feature.
- `js/config.js` does not define `fairnessThresholds`, `statusColors`, `chartConfig`, or `refreshIntervals`, although several modules access them. Affected views may fail or show fallbacks until these settings are implemented.
- System-health and audit-log source files exist, but the current page does not load them or expose them through the navigation switch.
- The dashboard's local order/assignment views are not wired to `/api/loads`. Changing JSON API data will not automatically change those views.
- The rotation button uses JavaScript rules and Firebase; it does not load the Python model. A mobile app is not included in this repository, so mobile synchronization must be verified in a separate client.

## API reference

All paths below are relative to `http://localhost:3001/api`. Send JSON bodies with `Content-Type: application/json`. Endpoints have no token or role enforcement in the current implementation.

### Health and drivers

| Method | Path | Body / behavior |
| --- | --- | --- |
| GET | `/health` | Returns status and server timestamp |
| GET | `/drivers` | Returns the driver array |
| GET | `/drivers/:id` | Returns a driver; `404` if absent |
| POST | `/drivers/login` | `{ "username": "...", "password": "..." }`; sets matching driver online and returns `{ "driver": ... }` |

Login returns `400` for missing credentials and `401` for a mismatch. It does not issue a token. **The checked-in drivers have no `username` or `password`, so there are no working seeded credentials for this API.** See [data compatibility](#seed-data-compatibility) before testing login.

### Delivery stops and ETA

| Method | Path | Body / behavior |
| --- | --- | --- |
| GET | `/routes/:driverId/stops` | Returns stops matching the driver ID |
| POST | `/routes/:driverId/stops/:stopId/start` | No body required; sets `in-progress` and resets `elapsedSeconds` to `0` |
| POST | `/routes/:driverId/stops/:stopId/complete` | `{ "elapsedSeconds": 420 }`; sets `completed` and stores elapsed/time-taken seconds |
| POST | `/routes/:driverId/stops/:stopId/feedback` | `{ "efforts": ["heavy", "stairs"] }`; replaces stop feedback |
| POST | `/eta/:driverId` | `{ "currentLat": 28.70, "currentLng": 77.10, "stopId": 1 }` |

Stop mutation endpoints return the updated stop or `404`. Stop IDs are converted to numbers. The mutation handlers look up only the stop ID, and ETA does not validate the driver ID or stop ownership.

ETA returns `{ "stopId", "distanceKm", "etaSeconds", "etaText" }`. It uses straight-line Haversine distance and a fixed speed of **20 km/h**, with no traffic or road routing. Display text has a minimum of `1 min`, even when calculated seconds are zero. Missing/invalid required input returns `400`, an unknown stop returns `404`, and missing numeric destination coordinates return `500`.

### Loads

| Method | Path | Body / behavior |
| --- | --- | --- |
| GET | `/loads` | Returns all loads |
| POST | `/loads` | Required: `pickupAddress`, `dropAddress`; optional: `weight`, `distanceKm`, `difficulty` |
| POST | `/loads/:id/assign-auto` | No body required; selects a driver and updates the load and driver workload |

Load creation returns `201` with a UUID, `unassigned` status, `assignedTo: null`, and creation timestamp. Weight and distance default to `0`; difficulty defaults to `Medium`. Assignment returns `{ "load": ..., "assignedDriver": ... }`, `404` for an unknown load, or `400` if no drivers exist.

### Support and chat

| Method | Path | Body / behavior |
| --- | --- | --- |
| POST | `/support/ai` | Required `message`; optional `driverId`, `driverName`; returns `aiReply`, `requestId`, `status` |
| GET | `/support/requests` | Lists pending requests |
| POST | `/support/requests/:id/accept` | Optional `managerId`, `managerName`; creates a chat with the request ID |
| GET | `/support/chats/:chatId` | Returns chat metadata and messages |
| POST | `/support/chats/:chatId/message` | Required `sender`, `text`; returns the created message with `201` |

Support replies use keyword checks for route, payment, and weight; there is no external AI service. Every valid support message creates a pending request. Driver defaults are `driver1` / `Driver`, and manager defaults are `manager1` / `Manager`. Chat retrieval is request-based; no WebSocket transport is included. Missing required fields return `400`; missing requests or chats return `404`.

## Example workflows

These PowerShell examples work on Windows and use the default API. **POST actions persist changes to `data/`; back up that directory before experimenting.**

### Read stops and calculate ETA

```powershell
$api = 'http://localhost:3001/api'
Invoke-RestMethod "$api/routes/driver1/stops"

$etaBody = @{ currentLat = 28.70; currentLng = 77.10; stopId = 1 } | ConvertTo-Json
Invoke-RestMethod "$api/eta/driver1" -Method Post -ContentType 'application/json' -Body $etaBody
```

### Create and assign a load

```powershell
$api = 'http://localhost:3001/api'
$loadBody = @{
    pickupAddress = 'Warehouse A, New Delhi'
    dropAddress = 'Customer B, New Delhi'
    weight = 8
    distanceKm = 6
    difficulty = 'Medium'
} | ConvertTo-Json

$load = Invoke-RestMethod "$api/loads" -Method Post -ContentType 'application/json' -Body $loadBody
Invoke-RestMethod "$api/loads/$($load.id)/assign-auto" -Method Post
```

### Create a support request and open a chat

```powershell
$api = 'http://localhost:3001/api'
$requestBody = @{ message = 'I have a route issue'; driverId = 'driver1'; driverName = 'Demo Driver' } | ConvertTo-Json
$request = Invoke-RestMethod "$api/support/ai" -Method Post -ContentType 'application/json' -Body $requestBody

Invoke-RestMethod "$api/support/requests/$($request.requestId)/accept" -Method Post -ContentType 'application/json' -Body '{}'
$messageBody = @{ sender = 'manager'; text = 'Please describe the issue.' } | ConvertTo-Json
Invoke-RestMethod "$api/support/chats/$($request.requestId)/message" -Method Post -ContentType 'application/json' -Body $messageBody
Invoke-RestMethod "$api/support/chats/$($request.requestId)"
```

## Data and fairness logic

### Local storage

`src/services/storage.js` reads and rewrites JSON files relative to the project directory. No migrations or seed command are required; sample files are included.

| File | Default API usage |
| --- | --- |
| `data/drivers.json` | Driver lookup/login and assignment workload |
| `data/stops.json` | Stops, coordinates, progress, and feedback |
| `data/loads.json` | Created and assigned loads |
| `data/chats.json` | Object containing `chatRequests` and `chats` arrays |
| `data/tasks.json`, `data/history.json`, `data/disputes.json` | Included data; not read by the default API routes |

Read or JSON-parse errors silently return an empty array. Writes replace complete files with no transaction or locking, so concurrent mutations can lose updates. Keep a backup for restoring demo state; there is no reset endpoint.

### Seed-data compatibility

The checked-in drivers use IDs `D1`–`D3` and fields `fairness_index` / `workload`. The default assignment helper expects `fairnessIndex` / `workloadWeight`, while seeded stops use `driver1`. These formats are not automatically translated.

For an internally consistent local demo, back up the data and explicitly align driver IDs, stop `driverId` values, and field names. A driver compatible with login and assignment looks like:

```json
{
  "id": "driver1",
  "name": "Demo Driver",
  "username": "demo-driver",
  "password": "local-demo-only",
  "status": "offline",
  "fairnessIndex": 1.0,
  "workloadWeight": 0
}
```

This is an example record to add or adapt, not an existing account. Passwords are currently stored and returned in plain text; use only disposable demo credentials.

### Assignment rules

The local API selects the driver with the lowest score:

```text
score = (fairnessIndex || 1) × (1 + (workloadWeight || 0) / 100)
```

Ties select the first driver. Assignment adds the load weight to `workloadWeight`. It does not filter offline drivers, enforce capacity, account for route distance/difficulty, or prevent repeated assignment of the same load. Repeating an assignment adds workload again.

`computeEffortScore()` also exists in `src/services/fairness.js`, using `min(120, 50 + difficulty × 3 + listedWeight × 1.5)`, but is not called by the current routes.

Dashboard rotation separately compares monthly and weekly values to derive a priority of `0`, `1`, or `2`, then matches it to route difficulty. It does not update workload between route choices, so multiple routes can select the same driver.

## Alternative Firebase server

`server.js` is a separate implementation, not the target of `npm start`. It requires `firebase-admin`, which is absent from the declared dependencies, and a local `serviceAccountKey.json`, which is ignored by Git.

**Every startup overwrites the Firebase `drivers` and `tasks` nodes with hard-coded sample data.** Use only a dedicated development database until that initialization is changed.

If you deliberately need this variant:

1. Create a dedicated Firebase development project and Realtime Database.
2. Install its missing dependency with `npm install firebase-admin` (this changes the package manifest and lockfile).
3. Place that project's service-account JSON at `serviceAccountKey.json` in the repository root. Keep the private key out of source control and static hosting.
4. Update `databaseURL` in `server.js` to the dedicated database. This value is hard-coded and is not read from `.env` or `js/config.js`.
5. Stop the default API if it uses port `3001`, then run `node server.js`.

This server uses a fixed port of `3001` and these unprefixed endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Firebase driver/task counts |
| POST | `/login` | Demo login: `driver1`, `driver2`, or `driver3`, each with password `1234` |
| GET | `/drivers` | Firebase driver list |
| GET | `/tasks` | Task list with derived weight, stairs, and difficulty score |
| POST | `/tasks/:id/complete` | Body `{ "driverId": "D1" }`; marks task complete and adds expected weight to workload |
| POST | `/drivers/:id/dispute` | Increments dispute count and lowers fairness index |

Its login returns a fixed demo token with no subsequent token enforcement. Its array-based seed records also differ from the dashboard rotation schema. These credentials and routes do not apply to `src/index.js`.

## Optional model training

Training is independent of the Node.js application. Create a virtual environment from the project root:

```sh
python -m venv .venv
```

Activate it using the command for your shell:

```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
```

```sh
# macOS / Linux
source .venv/bin/activate
```

Then install the script's dependencies and train:

```sh
python -m pip install numpy pandas scikit-learn joblib
python train-rotation-model.py
```

The script generates 20,000 synthetic samples with `weekly_effort`, `monthly_load`, `esp32_steps`, and `route_difficulty`, trains a 200-tree random forest, and overwrites `models/rotation-model.joblib`. No Python dependency lockfile or supported Python version range is supplied. Keep `.venv/` out of commits; it is not currently listed in `.gitignore`.

Treat this as an experiment: the model is fitted before the train/test split, so the printed accuracy includes training-data leakage. The generated monthly and weekly values also use very different scales, which can heavily skew the classes. The model is not integrated into dispatch decisions in this repository.

## Project structure

```text
Fair-Dispatch/
├── src/
│   ├── index.js                 # Default Express application
│   ├── routes/                  # Drivers, routes, loads, support, health, ETA
│   └── services/                # JSON persistence, fairness rules, chat logic
├── data/                        # Mutable sample JSON data
├── index.html                   # Manager dashboard
├── css/                         # Dashboard styles
├── js/                          # Dashboard modules and Firebase configuration
├── server.js                    # Alternative Firebase API with startup seeding
├── train-rotation-model.py       # Standalone synthetic-data training experiment
├── models/rotation-model.joblib  # Saved model artifact
├── package.json                 # Dependencies, Node requirement, start/dev scripts
├── package-lock.json            # Locked npm dependency tree
└── .gitignore                   # Excludes dependencies, .env, service-account key
```

## Verification and troubleshooting

There is no automated test suite, lint script, or build script configured. A basic API smoke check is:

```powershell
$api = 'http://localhost:3001/api'
Invoke-RestMethod "$api/health"
Invoke-RestMethod "$api/drivers"
Invoke-RestMethod "$api/drivers/D1"
Invoke-RestMethod "$api/routes/driver1/stops"
Invoke-RestMethod "$api/loads"
Invoke-RestMethod "$api/support/requests"
```

These reads and a non-mutating ETA request were verified against the checked-in sample data while preparing this README using Node.js 24.12.0. An unknown endpoint returned `404`. Firebase operations, browser behavior, and model training were not runtime-validated as part of that check.

| Symptom | What to check |
| --- | --- |
| `EADDRINUSE` | Another process uses the port. Stop it or change `PORT` for the default API. Both server variants default to `3001`. |
| `/` or `/health` returns `404` | With `npm start`, use `/api/health`. Serve the dashboard separately. |
| API driver login returns `401` | Seed records lack credentials. Add a compatible demo record; Firebase-server credentials belong to the other server. |
| `D1` has no stops | Seed stops use `driver1`. Align IDs or request `/api/routes/driver1/stops`. |
| Drivers appear equally ranked | Default assignment reads camelCase fields; the shipped drivers use different field names. |
| Data unexpectedly appears empty | Check that the relevant file in `data/` exists and contains valid JSON; read failures are suppressed. |
| `Cannot find module 'firebase-admin'` / missing service account | You started the optional `server.js`. Follow its setup, or use `npm start` for the local API. |
| Firebase permission errors | Verify project configuration and database rules. Dashboard demo login does not authenticate with Firebase. |
| Dashboard shows missing-property errors | Check the missing `AppConfig` sections listed under dashboard gaps and inspect the browser console. |
| `pdf-export.js` returns `404` | The referenced module is absent from the repository. |
| API updates do not appear in dashboard | The dashboard uses separate mock/Firebase data sources; API integration is not implemented. |
| Python import errors | Activate the environment and install the four training dependencies with that environment's Python. |

## Deployment considerations

The repository is a development prototype. Before a shared or production deployment, address the current implementation's concrete limitations:

- Implement authentication and authorization, hash driver passwords, and remove password fields from API responses.
- Enforce stop ownership, validate request types/ranges, and prevent duplicate load assignment or task completion from inflating workload.
- Replace whole-file JSON persistence with transactional storage, or restrict the API to a single process with appropriate write coordination. A container using the existing storage needs a writable persistent `data/` directory.
- Add consistent asynchronous error handling, appropriate CORS policy, and request protection. The default API currently enables unrestricted CORS.
- Reconcile API, Firebase, and dashboard schemas; complete missing dashboard settings and modules.
- Remove destructive Firebase startup seeding and implement database authentication/rules.
- Serve only frontend assets publicly. Keep `.env`, service-account keys, local data, and server files out of the static site.

For the default server, the runtime command remains `npm start`; there is no compilation step. Docker, CI, and hosting configuration are not included.

## Contributing and license

Keep changes focused, describe affected components and schema changes, and include the checks you performed. Back up demo data before write-based testing and review your diff to avoid committing incidental data changes or credentials. Update this README when endpoints or setup requirements change.

No license file is included in this repository. Confirm usage and redistribution terms with the repository owner.
