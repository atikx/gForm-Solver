
# gForm-Solver

A web extension to solve google form automaticly.


## Prerequisites (For using without Docker)
Make sure you have the following installed:
- Git (for clonning)
- Node.js (v16 or higher) to run server
- npm 
- A browser
- A gemini api key
## Installation

Go to manage extensions and load the dist folder present in the extension folder.After that run the server like this

```bash
  cd ./server
  npm i
  node ./server.js
```
Note:-To run this you have to also provide your gemini api key in the extension.(I am plannig to remove server and make it serverless so I will be needing your api key. DW it will not get shared with me 😁)
## 📁 Project Structure
```
gForm-Solver/
├── extension/dist/ # main folder to load
├── server/ # Backend application
└── README.md # This file
```
## Tech Stack Used

**Extension:** React, TailwindCSS, Manifest v3

**Server:** Node, Express

