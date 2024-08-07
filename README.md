# Apro Okx External Adapter

This external adapter uses the unauthenticated endpoints for connecting to the Okx Exchange API.

## Input Params

- `endpoint`: The endpoint of the API to query
- `data`: params

## Install

```bash
npm install
```

## Test

```bash
npm test
```

## Create the zip

```bash
zip -r okx-adapter.zip .
```

## Install to AWS Lambda

- In Lambda Functions, create function
- On the Create function page:
  - Give the function a name
  - Use Node.js 8.10 for the runtime
  - Choose an existing role or create a new one
  - Click Create Function
- Under Function code, select "Upload a .zip file" from the Code entry type drop-down
- Click Upload and select the `okx-adapter.zip` file
- Handler should remain index.handler
- Save


## Install to GCP

- In Functions, create a new function, choose to ZIP upload
- Click Browse and select the `okx-adapter.zip` file
- Select a Storage Bucket to keep the zip in
- Function to execute: gcpservice
