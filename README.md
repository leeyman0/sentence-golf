## Welcome to Sentence Golf!
Sentence golf is a game of sorts.

## Installing
For development:
1. Clone this repository
2. Run `npm install`

## Running
There are two ways that the Sentence Golf frequency scoring algorithm can be run. 

### Webpack UI
One is using the web interface. To run this, first build the source code into web format with webpack using `npm run build`. Then, use a webserver in the folder `src/web` to host a static website from which the user can score sentences.

### Node Headless
Another way to use this code is with nodejs. No additional build steps need to be run. The node package exports using the external interface contained in `src/scorer/scorer.mjs`.

## Development
- [x] Analyze/Process dataset of english vocabulary
- [x] Load dataset into Javascript
- [x] Use dataset to score sentences
- [ ] Create frontend webapp application using webpack 
  - [x] Get basic functionality down
  - [ ] Add configuration section