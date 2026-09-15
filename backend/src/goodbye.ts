import type { APIGatewayProxyHandler } from "aws-lambda";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handler: APIGatewayProxyHandler = async () => ({
  statusCode: 200,
  headers: corsHeaders,
  body: JSON.stringify({ message: "Say Goodbye" }),
});
