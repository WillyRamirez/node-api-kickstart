FROM node:14

# Create app directory
WORKDIR /usr/src/api

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# Bundle app source
COPY package.json .
COPY yarn.lock .
COPY index.js .
COPY .dockerignore .

RUN yarn install
RUN yarn global add nodemon
# If you are building your code for production
# RUN npm ci --only=production

COPY src ./src

EXPOSE 8080
CMD [ "node", "index.js" ]
