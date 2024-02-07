require("dotenv").config();
// Revolt Packages
const { Client } = require("revolt.js");

// Webpage Packages
const express = require("express");
const { createServer } = require("node:http");
const fs = require('fs');

// Text Width getter Packages
var pixelWidth = require("string-pixel-width");

// Log Stuff
const bl = require("betterdevlogs");
const log = bl({ logfolder: "logs" });

const url = "https://rbg.brandgrandreal.is-a.dev";

const client = new Client();

// Functions

// Revolt stuff
client.on("ready", async () => {
  log.info(`Logged in as ${client.user.username}!`);
  // Webpage Stuff :)
  const app = express();
  const server = createServer(app);
  const port = process.env.PORT;
  server.listen(port, () => {
    log.info("server running!");
  });
  
  app.get("/", async (req, res) => {
    res.sendFile(__dirname + "/home/index.htm");
  });
  
  app.get("/example.svg", async (req, res) => {
    res.sendFile(__dirname + "/home/example.svg");
  });
  
  app.get('/public/:fname', (req, res) => {
   if (!fs.readFileSync('./public/' + req.params.fname)) r404(res)
   else
    res.sendFile(__dirname + '/public/' + req.params.fname);
  });
  app.get('/favicon/:fname', (req, res) => {
   if (!fs.readFileSync('./favicon/' + req.params.fname)) r404(res)
   else
    res.sendFile(__dirname + '/favicon/' + req.params.fname);
  });
  
  app.get("/s/:id?", async (req, res) => {
    if (req.params.id) {
      const ID = req.params.id;
      const server = client.servers.get(ID);
      if (!server)
        return res.send(
          "Error: Server DOES NOT exist or the bot is NOT in it!"
        );
      const smembers = await server
        .fetchMembers()
        .then((res) => res.members.length);

      const fontSize = `110`;
      const font = `helvetica`;
      const textStyle = `font-family="${font}" font-size="${fontSize}"`;

      const title = `${server.name}: ${smembers} members`;
      const members = `${smembers} members`;

      const padding = 50;
      const memberstextWidth = pixelWidth(members, {
        font: font,
        size: fontSize,
      });
      const ServerNametextWidth = pixelWidth(server.name, {
        font: font,
        size: fontSize,
      });

      const ServerNametextBoxWidth = ServerNametextWidth + padding * 2;
      const memberstextBoxWidth = memberstextWidth + padding * 2;

      const SVG = `<svg width="170.2" height="20" viewBox="0 0 1702 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
  <title>${title}</title>
  <g>
    <rect fill="#555" width="${ServerNametextBoxWidth}" height="200"/>
    <rect fill="#ff4654" x="${ServerNametextBoxWidth}" width="${memberstextBoxWidth}" height="200"/>
  </g>
  <g aria-hidden="true" fill="#fff" text-anchor="start" ${textStyle}>
    <text x="60" y="148" textLength="${ServerNametextWidth}" fill="#000" opacity="0.1">${server.name}</text>
    <text x="50" y="138" textLength="${ServerNametextWidth}">${server.name}</text>
    <text x="${ServerNametextBoxWidth + padding}" y="148" textLength="${memberstextWidth}" fill="#000" opacity="0.1">${smembers} members</text>
    <text x="${ServerNametextBoxWidth + padding}" y="138" textLength="${memberstextWidth}">${smembers} members</text>
  </g>
</svg>`;
      res.setHeader("Content-Type", "image/svg+xml");
      res.send(SVG);
    } else {
      res.send("Error: No ID provided!");
    }
  });
});

client.on("messageCreate", async (message) => {
  if (message.content === "rbg!generate") {
    message.channel.sendMessage(`${url}/s/${message.server.id}`);
  } else if (message.content === "rbg!about") {
    message.channel.sendMessage(`Learn more here: ${url}`);
  }
});

client.loginBot(process.env.TOKEN);

// To keep running :)
process.on("uncaughtException", function (error) {
  console.log(error.stack);
});
